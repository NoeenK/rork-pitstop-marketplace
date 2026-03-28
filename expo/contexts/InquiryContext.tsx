import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "support_inquiries";

export interface Inquiry {
  id: string;
  subject: string;
  message: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
  responses: InquiryResponse[];
}

export interface InquiryResponse {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

export const [InquiryProvider, useInquiry] = createContextHook(() => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInquiries();
    }
  }, [user]);

  const loadInquiries = async () => {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setInquiries(parsed.map((i: any) => ({
          ...i,
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
          responses: i.responses.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          })),
        })));
      }
    } catch (error) {
      console.error("Failed to load inquiries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createInquiry = useCallback(async (subject: string, message: string) => {
    if (!user) return;

    try {
      const newInquiry: Inquiry = {
        id: Date.now().toString(),
        subject,
        message,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: [],
      };

      const updated = [newInquiry, ...inquiries];
      setInquiries(updated);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
      return newInquiry;
    } catch (error) {
      console.error("Failed to create inquiry:", error);
    }
  }, [inquiries, user]);

  const addResponse = useCallback(async (inquiryId: string, message: string, isAdmin: boolean = false) => {
    if (!user) return;

    try {
      const response: InquiryResponse = {
        id: Date.now().toString(),
        message,
        isAdmin,
        createdAt: new Date(),
      };

      const updated = inquiries.map((inquiry) => {
        if (inquiry.id === inquiryId) {
          return {
            ...inquiry,
            responses: [...inquiry.responses, response],
            updatedAt: new Date(),
            status: isAdmin ? "in-progress" : inquiry.status,
          } as Inquiry;
        }
        return inquiry;
      });

      setInquiries(updated);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to add response:", error);
    }
  }, [inquiries, user]);

  return {
    inquiries,
    isLoading,
    createInquiry,
    addResponse,
  };
});
