import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../../../create-context";
import { getSupabaseAdmin } from "@/backend/lib/supabase-admin";

export const sendMessageProcedure = publicProcedure
  .input(
    z.object({
      threadId: z.string().uuid(),
      senderId: z.string().uuid(),
      text: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
    }),
  )
  .mutation(async ({ input }) => {
    const supabase = getSupabaseAdmin();
    const { threadId, senderId, text } = input;

    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select("id, buyer_id, seller_id, unread_count")
      .eq("id", threadId)
      .maybeSingle();

    if (threadError) {
      console.error("[sendMessageProcedure] Failed to load thread", threadError);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load thread" });
    }

    if (!thread) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
    }

    if (senderId !== thread.buyer_id && senderId !== thread.seller_id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Sender is not part of this thread" });
    }

    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        thread_id: threadId,
        sender_id: senderId,
        text,
        created_at: new Date().toISOString(),
      })
      .select("id, thread_id, sender_id, text, created_at, read_at")
      .single();

    if (insertError || !message) {
      console.error("[sendMessageProcedure] Failed to insert message", insertError);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send message" });
    }

    const updatedUnreadCount = (thread.unread_count ?? 0) + 1;

    const { error: threadUpdateError } = await supabase
      .from("chat_threads")
      .update({
        last_message_at: message.created_at,
        unread_count: updatedUnreadCount,
      })
      .eq("id", threadId);

    if (threadUpdateError) {
      console.error("[sendMessageProcedure] Failed to update thread metadata", threadUpdateError);
    }

    return {
      id: message.id as string,
      threadId: message.thread_id as string,
      senderId: message.sender_id as string,
      text: message.text as string,
      createdAt: message.created_at as string,
      readAt: message.read_at as string | null,
    };
  });

export default sendMessageProcedure;
