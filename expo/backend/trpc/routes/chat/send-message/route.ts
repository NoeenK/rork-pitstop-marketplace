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
    try {
      const supabase = getSupabaseAdmin();
      const { threadId, senderId, text } = input;

      console.log("[sendMessageProcedure] Processing message:", { threadId, senderId, textLength: text.length });

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
        console.error("[sendMessageProcedure] Thread not found:", threadId);
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      if (senderId !== thread.buyer_id && senderId !== thread.seller_id) {
        console.error("[sendMessageProcedure] Unauthorized sender:", { senderId, buyerId: thread.buyer_id, sellerId: thread.seller_id });
        throw new TRPCError({ code: "FORBIDDEN", message: "Sender is not part of this thread" });
      }

      const { data: message, error: insertError } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          sender_id: senderId,
          user_id: senderId, // Required: profile.id = auth.users.id, so senderId can be used as user_id
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

      const response = {
        id: message.id,
        threadId: message.thread_id,
        senderId: message.sender_id,
        text: message.text,
        createdAt: message.created_at,
        readAt: message.read_at ?? null,
      };

      console.log("[sendMessageProcedure] Message sent successfully:", response.id);
      console.log("[sendMessageProcedure] Response:", JSON.stringify(response));
      return response;
    } catch (error) {
      console.error("[sendMessageProcedure] Unexpected error:", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({ 
        code: "INTERNAL_SERVER_ERROR", 
        message: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    }
  });

export default sendMessageProcedure;
