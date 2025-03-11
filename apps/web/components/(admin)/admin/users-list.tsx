"use client";

import { getMessagesByUserId, getUsers } from "./actions";
import InformationSheet from "./information-sheet";
import { Messages } from "./messages";
import { searchScore } from "@/lib/search/utils";
import { createClient } from "@/lib/supabase/client";
import { snakeToCamelCase } from "@/lib/utils";
import { Message, User } from "@/types/database";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  RefreshCwIcon,
} from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const activeUser = users.find((user) => user.id === activeUserId);
  const [search, setSearch] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const filteredUsers = users.sort((a, b) => {
    // Calculate scores for both contacts
    const scoreA = searchScore(JSON.stringify(a, null, 2), search, []);
    const scoreB = searchScore(JSON.stringify(b, null, 2), search, []);

    // Sort by descending order of scores
    return scoreB - scoreA;
  });

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await getUsers();
      if (error || !data) {
        return;
      }
      setUsers(data);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeUser) return;

    setIsLoadingMessages(true);
    try {
      const { data, error } = await getMessagesByUserId(activeUser.id);
      if (error || !data) {
        return;
      }
      setMessages(data);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeUser) {
      fetchMessages();
    }
  }, [activeUser]);

  // Subscribe to realtime message updates via Supabase
  useEffect(() => {
    if (!activeUser) return;
    const supabase = createClient();
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `user_id=eq.${activeUser.id}`,
        },
        (payload) => {
          setMessages((prevMessages) => {
            const newMessage = snakeToCamelCase(payload.new) as Message;
            // Avoid duplications
            const messagesSet = new Map(prevMessages.map((m) => [m.id, m]));
            messagesSet.set(newMessage.id, newMessage);
            return Array.from(messagesSet.values()) as Message[];
          });
        },
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [activeUser]);

  async function handleSelectUser(user: User) {
    setActiveUserId(user.id);
    window.history.pushState(null, "", `/admin/?activeUserId=${user.id}`);
  }

  return (
    <div className="relative flex h-[100svh]  w-full overflow-hidden border-b">
      <SidebarProvider>
        <Suspense>
          <Sidebar className="absolute">
            <SidebarHeader className="gap-3.5 border-b p-4">
              <div className="flex w-full items-center justify-between">
                <div className="text-foreground text-base font-medium">
                  聯絡人聊天室
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="h-8 w-8"
                  title="Refresh users"
                >
                  <RefreshCwIcon
                    className={cn("h-4 w-4", isLoadingUsers && "animate-spin")}
                  />
                </Button>
              </div>
              <div className="flex w-full items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <span>未讀</span>
                  <Switch
                    className="shadow-none"
                    checked={onlyUnread}
                    onCheckedChange={setOnlyUnread}
                  />
                </Label>
              </div>
              <SidebarInput
                placeholder="搜尋..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup className="container pb-64">
                <SidebarGroupContent className="space-y-2">
                  {!users ||
                    (users.length === 0 && (
                      <div className="space-y-2">
                        <Skeleton className="h-12" />{" "}
                        <Skeleton className="h-12" />
                      </div>
                    ))}
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      className={cn(
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground bg-background flex w-full flex-col items-start gap-2 whitespace-nowrap rounded border p-4 text-sm leading-tight",
                        activeUser?.id === user.id &&
                          "bg-sidebar-accent text-sidebar-accent-foreground",
                      )}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex w-full flex-wrap items-center gap-2">
                        <span className="font-medium">{user.displayName}</span>{" "}
                        <span className="space-x-2"></span>
                      </div>

                      <div className="flex w-full flex-nowrap gap-2 overflow-auto">
                        <Badge
                          variant={user.lineUserId ? "green" : "secondary"}
                        >
                          {user.lineUserId ? "已連結" : "未連結"}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          <Suspense>
            <SidebarInset className="w-full overflow-hidden">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="mr-auto flex items-center gap-2 px-4">
                  <CustomSidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  {activeUser && (
                    <div className="text-foreground line-clamp-1 font-medium">
                      {activeUser.displayName}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mr-4">
                  {activeUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchMessages}
                      disabled={isLoadingMessages}
                      className="h-8 w-8"
                      title="Refresh messages"
                    >
                      <RefreshCwIcon
                        className={cn(
                          "h-4 w-4",
                          isLoadingMessages && "animate-spin",
                        )}
                      />
                    </Button>
                  )}
                  {activeUser && <InformationSheet activeUser={activeUser} />}
                </div>
              </header>
              <Suspense>
                {!messages || !activeUser ? (
                  <div className="container w-full space-y-4 py-8">
                    <Skeleton className="h-12 w-2/3" />
                    <Skeleton className="ml-auto h-8 w-2/3" />
                    <Skeleton className="h-8 w-2/3" />
                  </div>
                ) : (
                  <Messages messages={messages} activeUser={activeUser} />
                )}
              </Suspense>
            </SidebarInset>
          </Suspense>
        </Suspense>
      </SidebarProvider>
    </div>
  );
}

const CustomSidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {open ? (
        <ChevronsLeftIcon className="text-muted-foreground" size={24} />
      ) : (
        <ChevronsRightIcon className="text-muted-foreground" size={24} />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});

CustomSidebarTrigger.displayName = "CustomSidebarTrigger";
