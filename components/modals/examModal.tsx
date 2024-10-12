"use client";

import { Exam } from 'webuntis';
import { ExamEvent } from '../CustCalendar/types';
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogHeader
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeExam } from '@/actions/data/exams';

interface ExamModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedEvent: ExamEvent | null;
    refetch: () => void;
}

const formatTime = (time: number) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const formatDate = (date: number) => {
    const year = Math.floor(date / 10000);
    const month = Math.floor((date % 10000) / 100);
    const day = date % 100;

    const newDate = new Date(year, month - 1, day);
    return `${newDate.getDate()}${dateSuffix(newDate.getDate())} of ${newDate.toLocaleString('default', { month: 'long' })} ${year}`;
}

const dateSuffix = (day: number) => {
    if (day === 1 || day === 21 || day === 31) return 'st';
    if (day === 2 || day === 22) return 'nd';
    if (day === 3 || day === 23) return 'rd';
    return 'th';
}

export const ExamModal = ({ modalOpen, setModalOpen, selectedEvent, refetch }: ExamModalProps) => {
    const queryClient = useQueryClient();

    const { mutateAsync: server_removeExam, isPending: isPendingExam } = useMutation({
        mutationFn: removeExam,
        onError: (res) => {
            const error = res;

            toast.error(error.message);
        },
        onSuccess: async (res) => {
            const response = await res;
            const removedType = response.removedExams.length > 0 ? 'exam' : response.removedSubjects.length > 0 ? 'subject' : 'teacher';

            toast.success(`${removedType} removed successfully`);
            queryClient.invalidateQueries({ queryKey: ["exams"] });

            refetch();
        },
    });

    if (!selectedEvent) return null;

    const extendedProps = selectedEvent.extendedProps;
    const exam: Exam = extendedProps?.exam;
    if (!exam) return null;

    const { endTime, examDate, examType, name, rooms, startTime, studentClass, subject, teachers, text } = exam;

    const handleRemove = (type: 'subject' | 'teacher' | 'exam') => {
        console.log(`Removing ${type}:`, exam);
        const data = {
            removedExams: type === 'exam' ? [name] : [],
            removedSubjects: type === 'subject' ? [subject] : [],
            removedTeachers: type === 'teacher' ? teachers : [],
            userId: undefined,
        }

        server_removeExam(data)
    };

    return (
        <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
            <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{examType}: {name}</DialogTitle>
                    <DialogDescription>
                        <p><strong>Description:</strong> {text}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Date:</strong> {formatDate(examDate)}</p>
                        <p><strong>Start Time:</strong> {formatTime(startTime)}</p>
                        <p><strong>End Time:</strong> {formatTime(endTime)}</p>
                        <p><strong>Class:</strong> {studentClass.join(', ')}</p>
                        <p><strong>Rooms:</strong> {rooms.join(', ')}</p>
                        <p><strong>Teachers:</strong> {teachers.join(', ')}</p>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={'destructive'}>Remove</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                            <DropdownMenuItem onClick={() => handleRemove('subject')}>Remove Subject</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRemove('teacher')}>Remove Teacher</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRemove('exam')}>Remove Exam</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
