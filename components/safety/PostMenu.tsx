"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { REPORT_REASONS, REPORT_REASON_LABELS } from "@/lib/validations/safety";

type Props = {
  postId: string;
  authorId: string | null;
  currentUserId: string | null;
  onHide: () => void;
  onBlock: () => void;
};

export default function PostMenu({
  postId,
  authorId,
  currentUserId,
  onHide,
  onBlock,
}: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 자기 게시글이면 메뉴 미표시
  if (!currentUserId || (authorId && authorId === currentUserId)) return null;

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleHide() {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/safety/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) throw new Error();
      onHide();
      toast.success("게시글을 숨겼어요.");
    } catch {
      toast.error("숨기기에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock() {
    if (!authorId) return;
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/safety/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId: authorId }),
      });
      if (!res.ok) throw new Error();
      onBlock();
      toast.success("작성자를 차단했어요.");
    } catch {
      toast.error("차단에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReport() {
    if (!reason) return;
    setLoading(true);
    try {
      const res = await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, reason }),
      });
      if (!res.ok) throw new Error();
      setDialogOpen(false);
      setReason(null);
      toast.success("신고가 접수됐어요.");
    } catch {
      toast.error("신고에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 더보기 버튼 + 드롭다운 */}
      <div
        ref={menuRef}
        className="relative"
        onClick={(e) => e.preventDefault()}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          aria-label="더보기"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="4" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-7 z-50 min-w-30 rounded-lg border border-border bg-card shadow-md py-1">
            <button
              onClick={handleHide}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
            >
              숨기기
            </button>
            {authorId && (
              <button
                onClick={handleBlock}
                disabled={loading}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
              >
                작성자 차단
              </button>
            )}
            <button
              onClick={() => {
                setOpen(false);
                setDialogOpen(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted transition-colors"
            >
              신고
            </button>
          </div>
        )}
      </div>

      {/* 신고 다이얼로그 */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setReason(null);
        }}
      >
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>게시글 신고</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {REPORT_REASONS.map((r) => (
              <label
                key={r}
                className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 hover:bg-muted transition-colors"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">
                  {REPORT_REASON_LABELS[r]}
                </span>
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleReport} disabled={!reason || loading}>
              {loading ? "처리 중..." : "신고하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
