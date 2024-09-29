"use client";

import { ExamEvent } from '../CustCalendar/types';
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';

interface ExamModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedEvent: ExamEvent | null;
}

export const ExamModal = ({ modalOpen, setModalOpen, selectedEvent }: ExamModalProps) => {
    if (!selectedEvent) return null;

    return (
        <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
            <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Exam Modal</DialogTitle>
                    <DialogDescription>
                        {selectedEvent?.type}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {/* <Button type="submit">Confirm</Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}