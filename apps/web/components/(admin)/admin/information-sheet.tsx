import { User } from "@/types/database";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Label } from "@workspace/ui/components/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Info } from "lucide-react";

export default function InformationSheet({ activeUser }: { activeUser: User }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Info className="ml-2 mr-4 size-4 cursor-pointer" />
      </SheetTrigger>
      <SheetContent className="w-full overflow-auto pb-36 sm:max-w-xl md:max-w-2xl">
        <SheetHeader>
          <SheetTitle>聯絡人資訊</SheetTitle>
          <SheetDescription>
            {activeUser?.displayName} 的詳細資訊如下
          </SheetDescription>
        </SheetHeader>
        <Avatar className="mx-auto my-4">
          <AvatarImage src={activeUser?.pictureUrl || undefined} />
          <AvatarFallback>{activeUser?.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="prose text-start">
          <Label>聯絡人基本資訊</Label>
          {activeUser?.age && <p>年齡：{activeUser?.age}</p>}
          {activeUser?.gender && <p>性別：{activeUser?.gender}</p>}
          {activeUser?.email && <p>電子郵件：{activeUser?.email}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
