"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const formSchema = z.object({
  chatModelId: z.string().min(1, { message: "Chat Model ID is required." }),
  imageModelId: z.string().min(1, { message: "Image Model ID is required." }),
});

type Step2ModelIdsProps = {
  defaultValues: Partial<z.infer<typeof formSchema>>;
  onNext: (data: z.infer<typeof formSchema>) => void;
  onBack: () => void;
};

export function Step2ModelIds({ defaultValues, onNext, onBack }: Step2ModelIdsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Step 2: Model Selection</CardTitle>
        <CardDescription>Specify the Model IDs for chat and image generation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
            <FormField
              control={form.control}
              name="chatModelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat Model ID</FormLabel>
                  <FormControl>
                    <Input placeholder="gpt-3.5-turbo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageModelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Generation Model ID</FormLabel>
                  <FormControl>
                    <Input placeholder="dall-e-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between gap-4">
              <Button type="button" variant="outline" onClick={onBack} className="w-full">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="w-full">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
