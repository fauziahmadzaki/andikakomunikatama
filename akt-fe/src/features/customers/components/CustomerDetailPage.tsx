"use client";

import { ArrowLeftIcon, BanIcon, CheckCircleIcon, PencilIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  customerStatusLabel,
  customerStatusTone,
} from "@/features/customers/data/status";
import { useCustomerDetail } from "@/features/customers/hooks/useCustomerDetail";
import { formatRupiah } from "@/lib/format";
import { CustomerAccountTab } from "./CustomerAccountTab";
import { CustomerAddressesTab } from "./CustomerAddressesTab";
import { CustomerBillingTab } from "./CustomerBillingTab";
import {
  CustomerAccountDialog,
  CustomerAddressDialog,
  CustomerContactDialog,
  CustomerIdentityDialog,
} from "./CustomerChildDialogs";
import { CustomerContactsTab } from "./CustomerContactsTab";
import { CustomerEditDialog } from "./CustomerEditDialog";
import { CustomerNetworkTab } from "./CustomerNetworkTab";
import { CustomerProfileCard } from "./CustomerProfileCard";
import { CustomerStatusHistoryTab } from "./CustomerStatusHistoryTab";
import { CustomerSubscriptionsTab } from "./CustomerSubscriptionsTab";
import { CustomerTicketsTab } from "./CustomerTicketsTab";

export function CustomerDetailPage({ id }: { id: string }) {
  const {
    customer,
    subscription,
    customerInvoices,
    customerTickets,
    customerServices,
    addresses,
    contacts,
    identities,
    statusHistory,
    account,
    branches,
    employees,
    editOpen,
    setEditOpen,
    openEdit,
    confirmOpen,
    setConfirmOpen,
    form,
    setForm,
    saveEdit,
    confirmToggle,
    addressOpen,
    setAddressOpen,
    editingAddressId,
    addressForm,
    setAddressForm,
    openCreateAddress,
    openEditAddress,
    saveAddress,
    requestDelete,
    pendingDelete,
    setPendingDelete,
    confirmDelete,
    contactOpen,
    setContactOpen,
    editingContactId,
    contactForm,
    setContactForm,
    openCreateContact,
    openEditContact,
    saveContact,
    identityOpen,
    setIdentityOpen,
    editingIdentityId,
    identityForm,
    setIdentityForm,
    openCreateIdentity,
    openEditIdentity,
    saveIdentity,
    accountOpen,
    setAccountOpen,
    accountForm,
    setAccountForm,
    openAccount,
    saveAccount,
  } = useCustomerDetail(id);

  if (!customer) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Pelanggan tidak ditemukan</p>
        <p className="text-sm text-muted-foreground">
          Data mungkin sudah dihapus atau belum tersinkron.
        </p>
        <LinkButton href="/dashboard/pelanggan">Kembali ke daftar</LinkButton>
      </div>
    );
  }

  const isActive = customer.status === "active";
  const deleteLabel =
    pendingDelete?.type === "address"
      ? "alamat"
      : pendingDelete?.type === "contact"
        ? "kontak"
        : "identitas";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <LinkButton
            href="/dashboard/pelanggan"
            variant="ghost"
            size="sm"
            className="-ml-2"
          >
            <ArrowLeftIcon />
            Kembali
          </LinkButton>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {customer.fullName}
              </h1>
              <StatusBadge tone={customerStatusTone[customer.status]}>
                {customerStatusLabel[customer.status]}
              </StatusBadge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {customer.customerNumber} · {customer.branchName}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onPress={openEdit}>
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant={isActive ? "destructive" : "default"}
            onPress={() => setConfirmOpen(true)}
          >
            {isActive ? <BanIcon /> : <CheckCircleIcon />}
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Jenis pelanggan",
            value:
              customer.registrationType === "new"
                ? "Baru"
                : customer.registrationType === "survey"
                  ? "Survey"
                  : "Lama",
          },
          { label: "Paket", value: customer.planName },
          { label: "Biaya bulanan", value: formatRupiah(customer.monthlyFee) },
          { label: "Outstanding", value: formatRupiah(customer.outstanding) },
          {
            label: "Jatuh tempo",
            value: customer.dueDay ? `Tanggal ${customer.dueDay}` : "-",
          },
          {
            label: "Registrasi",
            value: customer.registeredAt,
          },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultSelectedKey="overview" className="space-y-4">
        <TabsList variant="line" className="flex-wrap">
          <TabsTrigger id="overview">Ringkasan</TabsTrigger>
          <TabsTrigger id="addresses">Alamat</TabsTrigger>
          <TabsTrigger id="contacts">Kontak & Identitas</TabsTrigger>
          <TabsTrigger id="history">Riwayat Status</TabsTrigger>
          <TabsTrigger id="account">Akun Portal</TabsTrigger>
          <TabsTrigger id="subscription">Langganan</TabsTrigger>
          <TabsTrigger id="billing">Tagihan</TabsTrigger>
          <TabsTrigger id="tickets">Tiket</TabsTrigger>
          <TabsTrigger id="network">Jaringan</TabsTrigger>
        </TabsList>

        <TabsContent id="overview">
          <CustomerProfileCard customer={customer} />
        </TabsContent>
        <TabsContent id="addresses">
          <CustomerAddressesTab
            addresses={addresses}
            onAdd={openCreateAddress}
            onEdit={openEditAddress}
            onDelete={(address) => requestDelete("address", address.id)}
          />
        </TabsContent>
        <TabsContent id="contacts">
          <CustomerContactsTab
            contacts={contacts}
            identities={identities}
            onAddContact={openCreateContact}
            onEditContact={openEditContact}
            onDeleteContact={(contact) => requestDelete("contact", contact.id)}
            onAddIdentity={openCreateIdentity}
            onEditIdentity={openEditIdentity}
            onDeleteIdentity={(identity) =>
              requestDelete("identity", identity.id)
            }
          />
        </TabsContent>
        <TabsContent id="history">
          <CustomerStatusHistoryTab history={statusHistory} />
        </TabsContent>
        <TabsContent id="account">
          <CustomerAccountTab account={account} onEdit={openAccount} />
        </TabsContent>
        <TabsContent id="subscription">
          <CustomerSubscriptionsTab
            subscription={subscription}
            planName={customer.planName}
            services={customerServices}
          />
        </TabsContent>
        <TabsContent id="billing">
          <CustomerBillingTab
            invoices={customerInvoices}
            subscription={subscription}
          />
        </TabsContent>
        <TabsContent id="tickets">
          <CustomerTicketsTab tickets={customerTickets} />
        </TabsContent>
        <TabsContent id="network">
          <CustomerNetworkTab services={customerServices} />
        </TabsContent>
      </Tabs>

      <CustomerEditDialog
        open={editOpen}
        form={form}
        setForm={setForm}
        branches={branches}
        employees={employees}
        onClose={() => setEditOpen(false)}
        onSave={saveEdit}
      />

      <CustomerAddressDialog
        open={addressOpen}
        form={addressForm}
        setForm={setAddressForm}
        isEditing={Boolean(editingAddressId)}
        onSave={saveAddress}
        onClose={() => setAddressOpen(false)}
      />
      <CustomerContactDialog
        open={contactOpen}
        form={contactForm}
        setForm={setContactForm}
        isEditing={Boolean(editingContactId)}
        onSave={saveContact}
        onClose={() => setContactOpen(false)}
      />
      <CustomerIdentityDialog
        open={identityOpen}
        form={identityForm}
        setForm={setIdentityForm}
        isEditing={Boolean(editingIdentityId)}
        onSave={saveIdentity}
        onClose={() => setIdentityOpen(false)}
      />
      <CustomerAccountDialog
        open={accountOpen}
        form={accountForm}
        setForm={setAccountForm}
        onSave={saveAccount}
        onClose={() => setAccountOpen(false)}
      />

      <ConfirmationDialog
        open={confirmOpen}
        title={isActive ? "Nonaktifkan pelanggan?" : "Aktifkan pelanggan?"}
        description="Riwayat tagihan dan data pelanggan tetap disimpan."
        confirmLabel={isActive ? "Nonaktifkan" : "Aktifkan"}
        destructive={isActive}
        onConfirm={confirmToggle}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        title={`Hapus ${deleteLabel}?`}
        description="Data akan dihapus dari prototype dan tidak dapat dikembalikan."
        confirmLabel="Hapus"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
