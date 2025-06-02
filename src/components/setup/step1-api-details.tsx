"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const formSchema = z.object({
  apiBaseUrl: z.string().url({ message: "Please enter a valid URL." }).min(1, { message: "API Base URL is required." }),
  apiKey: z.string().min(1, { message: "API Key is required." }),
});

type Step1ApiDetailsProps = {
  defaultValues: Partial<z.infer<typeof formSchema>>;
  onNext: (data: z.infer<typeof formSchema>) => void;
};

export function Step1ApiDetails({ defaultValues, onNext }: Step1ApiDetailsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Step 1: API Configuration</CardTitle>
        <CardDescription>Enter your OpenAI compatible API Base URL and API Key.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiBaseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Base URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/v1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
