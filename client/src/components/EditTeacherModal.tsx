import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Edit } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  nip: string;
  subject: string;
}

interface EditTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
}

const editTeacherSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  nip: z.string().min(1, "NIP wajib diisi"),
  subject: z.string().min(1, "Mata pelajaran wajib diisi"),
  password: z.string().optional(),
});

type EditTeacherData = z.infer<typeof editTeacherSchema>;

export default function EditTeacherModal({ open, onOpenChange, teacher }: EditTeacherModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<EditTeacherData>({
    resolver: zodResolver(editTeacherSchema),
    defaultValues: {
      name: "",
      email: "",
      nip: "",
      subject: "",
      password: "",
    },
  });

  // Update form values when teacher data changes
  React.useEffect(() => {
    if (teacher) {
      form.reset({
        name: teacher.name,
        email: teacher.email,
        nip: teacher.nip,
        subject: teacher.subject,
        password: "",
      });
    }
  }, [teacher, form]);

  const editTeacherMutation = useMutation({
    mutationFn: async (data: EditTeacherData) => {
      if (!teacher?.id) {
        throw new Error("Teacher ID is required");
      }

      const updateData = { ...data };
      // Remove password if empty
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }
      
      const response = await apiRequest('PUT', `/api/admin/teachers/${teacher.id}`, updateData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update teacher');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      
      // Reset form and close modal
      form.reset();
      onOpenChange(false);
      
      toast({
        title: "Berhasil",
        description: "Data guru berhasil diperbarui",
      });
    },
    onError: (error: Error) => {
      console.error('Edit teacher error:', error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal memperbarui data guru",
      });
    },
  });

  const onSubmit = (data: EditTeacherData) => {
    if (!teacher) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Data guru tidak ditemukan",
      });
      return;
    }
    
    editTeacherMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Don't render if no teacher is selected
  if (!teacher) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2 flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Data Guru
          </DialogTitle>
          <p className="text-gray-600">Perbarui data guru: {teacher.name}</p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nama lengkap guru"
                      disabled={editTeacherMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Email guru"
                      disabled={editTeacherMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nomor Induk Pegawai"
                      disabled={editTeacherMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Pelajaran *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Mata pelajaran yang diampu"
                      disabled={editTeacherMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Kosongkan jika tidak ingin mengubah password"
                      disabled={editTeacherMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">
                    * Kosongkan field ini jika tidak ingin mengubah password
                  </p>
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={editTeacherMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={editTeacherMutation.isPending}
              >
                {editTeacherMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}