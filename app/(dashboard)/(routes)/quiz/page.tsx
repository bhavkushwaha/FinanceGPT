"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import * as z from "zod";
import { FileQuestion } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { useRouter } from "next/navigation";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Heading } from "@/components/heading";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useProModal } from "@/hooks/use-pro-modal";
import QuizCard from "@/components/quiz-card";
import { useToast } from "@/hooks/use-toast";

const QuizPage = () => {
  const router = useRouter();

  const proModal = useProModal();

  const { toast } = useToast();

  const [quizzes, setQuizzes] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      numQuestions: "1",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get("/api/quiz");
      console.log(response.data);
      setQuizzes(response.data);
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        variant: "destructive",
        description: "Error fetching quizzes",
      });

      if (error?.response?.status === 403) {
        proModal.onOpen();
      }
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionMessageParam = {
        role: "user",
        content:
          values.prompt +
          " ***** number of questions: " +
          values.numQuestions.toString(),
      };

      const response = await axios.post("/api/quiz/generate", {
        message: userMessage,
      });

      console.log(response.data);

      form.reset();
      fetchQuizzes();
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
      message += `${
        key === "numQuestions" ? "Number of questions" : "Prompt"
      }: ${value.message}\n\n`;
    }

    toast({
      title: "Invalid Input",
      variant: "destructive",
      description: message,
    });
  };

  return (
    <div>
      <Heading
        title="Quiz Generation"
        description="Generate quizes using descriptive text."
        icon={FileQuestion}
        iconColor="text-violet-700"
        bgColor="bg-violet-700/10"
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
                  <FormItem className="col-span-10 lg:col-span-9">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Type topic name... (select number of questions from 1 to 5)"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="numQuestions"
                render={({ field }) => (
                  <FormItem className="col-span-2 lg:col-span-1">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-2 p-3 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
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

          {quizzes.length === 0 && !isLoading && (
            <div>
              <Empty label="No quiz generated." />
            </div>
          )}

          <div className="flex flex-row flex-wrap items-center gap-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz?.id} {...quiz} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
