"use client";

import { PageHeader } from "@/components/nav/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles } from "lucide-react";
import BrowsePanel from "./components/browse-panel";
import AIPanel from "./components/ai-panel";

export default function page() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Find care"
        title="Find a doctor"
        description="Browse the directory, or let our AI match a specialist to your symptoms."
      />
      <Tabs defaultValue="browse" className="space-y-8">
        <TabsList className="rounded-full bg-card p-1">
          <TabsTrigger value="browse" className="rounded-full">
            <Search className="mr-1.5 h-4 w-4" /> Browse
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-full">
            <Sparkles className="mr-1.5 h-4 w-4" /> AI symptom match
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <BrowsePanel />
        </TabsContent>
        <TabsContent value="ai">
          <AIPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
