import { Job } from "@/types/database";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { MoreHorizontal, Pause, Trash } from "lucide-react";

export function JobList({
  jobs,
  onDelete,
  onPause,
}: {
  jobs: Job[];
  onDelete: (id: string) => void;
  onPause: (id: string) => void;
}) {
  return (
    <Table>
      <TableCaption>您的工作列表</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">名稱</TableHead>
          <TableHead>狀態</TableHead>
          <TableHead>排程</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.name}</TableCell>
            <TableCell>{job.status}</TableCell>
            <TableCell>{job.schedule}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => onDelete(job.id)}>
                    <Trash />
                    刪除
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onPause(job.id)}>
                    <Pause />
                    暫停
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>總計</TableCell>
          <TableCell className="text-right">{jobs.length} 個工作</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
