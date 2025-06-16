import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface CreateTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createTeacherSchema = insertUserSchema.pick({
  name: true,
  email: true,
  password: true,
  nip: true,
  subject: true,
});

type CreateTeacherData = z.infer<typeof createTeacherSchema>;

export default function CreateTeacherModal({ open, onOpenChange }: CreateTeacherModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<CreateTeacherData>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      nip: "",
      subject: "",
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: CreateTeacherData) => {
      const response = await apiRequest('POST', '/api/admin/teachers', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      form.reset();
      onOpenChange(false);
      toast({
        title: "Berhasil",
        description: "Akun guru berhasil dibuat",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal membuat akun guru",
      });
    },
  });

  const onSubmit = (data: CreateTeacherData) => {
    createTeacherMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2">Buat Akun Guru Baru</DialogTitle>
          <p className="text-gray-600">Isi data guru untuk membuat akun baru</p>
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
                      placeholder="email@smk.sch.id"
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
                  <FormLabel>Password Sementara *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Password untuk guru"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createTeacherMutation.isPending}
              >
                {createTeacherMutation.isPending ? "Membuat..." : "Buat Akun"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
