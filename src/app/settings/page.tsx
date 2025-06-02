"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/layout/app-header";
import type { Theme } from "@/lib/types";
import { RefreshCcw, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const settingsFormSchema = z.object({
  apiBaseUrl: z.string().url({ message: "Please enter a valid URL." }).min(1, { message: "API Base URL is required." }),
  apiKey: z.string().min(1, { message: "API Key is required." }),
  chatModelId: z.string().min(1, { message: "Chat Model ID is required." }),
  imageModelId: z.string().min(1, { message: "Image Model ID is required." }),
  theme: z.enum(['light', 'dark', 'system']),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const settings = useSettings();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      apiBaseUrl: settings.apiBaseUrl,
      apiKey: settings.apiKey,
      chatModelId: settings.chatModelId,
      imageModelId: settings.imageModelId,
      theme: settings.theme,
    },
    // Update form when settings context changes (e.g., after reset)
    values: {
        apiBaseUrl: settings.apiBaseUrl,
        apiKey: settings.apiKey,
        chatModelId: settings.chatModelId,
        imageModelId: settings.imageModelId,
        theme: settings.theme,
    }
  });

  const onSubmit = (data: SettingsFormValues) => {
    settings.updateSettings(data);
    toast({
      title: "Settings Saved",
      description: "Your configurations have been updated.",
    });
  };

  const handleResetSettings = () => {
    settings.resetSettings();
    // Form values will update due to `values` prop in useForm
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to their defaults.",
      variant: "destructive"
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Application Settings</CardTitle>
              <CardDescription>
                Manage your API configurations, model preferences, and application theme.
                Changes are saved locally in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          <Input type="password" placeholder="sk-xxxxxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <Select onValueChange={field.onChange as (value: Theme) => void} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how Rift AI Assistant looks.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button type="submit" className="w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" /> Save Settings
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" className="w-full sm:w-auto">
                          <RefreshCcw className="mr-2 h-4 w-4" /> Reset to Defaults
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will reset all your settings to their default values, including API keys and model IDs. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetSettings}>
                            Yes, reset settings
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
