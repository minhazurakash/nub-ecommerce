"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AddressCard } from "@/components/account/address-card";
import {
  AddressForm,
  type AddressFormValues,
} from "@/components/account/address-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Address } from "@/lib/types/database";
import {
  createAddress,
  deleteAddress,
  updateAddress,
} from "@/modules/account/actions";

type AddressesManagerProps = {
  addresses: Address[];
};

export function AddressesManager({ addresses }: AddressesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editingAddress = editingId
    ? addresses.find((address) => address.id === editingId)
    : null;

  function openCreate() {
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
  }

  function handleSubmit(values: AddressFormValues) {
    startTransition(async () => {
      const payload = {
        ...values,
        line2: values.line2 || undefined,
      };

      const result = editingId
        ? await updateAddress(editingId, payload)
        : await createAddress(payload);

      if (result.success) {
        toast.success(editingId ? "Address updated" : "Address added");
        closeDialog();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;

    startTransition(async () => {
      const result = await deleteAddress(id);
      if (result.success) {
        toast.success("Address deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-poppins)] text-xl font-semibold tracking-tight sm:text-2xl">
            Addresses
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your shipping addresses
          </p>
        </div>
        <Button onClick={openCreate} disabled={isPending} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed p-8 text-center sm:p-12">
          <p className="text-muted-foreground">No saved addresses yet.</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit address" : "Add address"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editingAddress
                ? "Update your shipping address details."
                : "Save a new shipping address for faster checkout."}
            </p>
          </DialogHeader>
          <AddressForm
            key={editingId ?? "new"}
            defaultValues={
              editingAddress
                ? {
                    label: editingAddress.label,
                    fullName: editingAddress.fullName,
                    phone: editingAddress.phone,
                    line1: editingAddress.line1,
                    line2: editingAddress.line2 ?? "",
                    city: editingAddress.city,
                    state: editingAddress.state,
                    postalCode: editingAddress.postalCode,
                    country: editingAddress.country,
                    isDefault: editingAddress.isDefault,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            submitLabel={editingAddress ? "Update address" : "Save address"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
