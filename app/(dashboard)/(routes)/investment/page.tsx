"use client";

import { useState } from "react";
import axios from "axios";
import * as z from "zod";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Heading } from "@/components/heading";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { useProModal } from "@/hooks/use-pro-modal";
import { useToast } from "@/hooks/use-toast";

const DoubtSolvePage = () => {
  const router = useRouter();

  const proModal = useProModal();

  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionMessageParam = {
        role: "user",
        content: values.prompt,
      };

      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/investment", {
        messages: newMessages,
      });

      setMessages((current) => [...current, userMessage, response.data]);

      form.reset();
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        variant: "destructive",
        description: error?.response?.data ?? "Please try again.",
      });

      if (error?.response?.status === 403) {
        proModal.onOpen();
      }
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  const onInvalidInput = (errors: object) => {
    let message = "";

    for (const [key, value] of Object.entries(errors)) {
      message += `Prompt: ${value.message}\n\n`;
    }

    toast({
      title: "Invalid Input",
      variant: "destructive",
      description: message,
    });
  }

  return (
    <div>
      <Heading
        title="Investment Strategies"
        description="Get the latest insights to help in making Financial Decisions backed by Data processed by our AI."
        icon={MessageSquare}
        iconColor="text-red-500"
        bgColor="bg-red-700/10"
      />
      <div className="px-4 lg:px-8 pb-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onInvalidInput)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="What is the past 10 year trend of the Nvidia Stock?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div>
              <Empty label="No conversation started." />
            </div>
          )}

          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message) => (
              <div
                key={String(message.content)}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user"
                    ? "bg-white border border-black/10"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <ReactMarkdown
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto w-full my-2 bg-black p-2 rounded-lg text-white">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-black/10 rounded-lg p-2" {...props} />
                    ),
                  }}
                  className="text-sm overflow-hidden leading-7"
                >
                  {String(message.content) || ""}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubtSolvePage;
