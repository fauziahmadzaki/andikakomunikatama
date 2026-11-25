import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Router } from "@/features/network/data/types";
import type {
  SetPlanProfileField,
  PlanProfileWizardForm,
} from "@/features/plan-profiles/hooks/usePlanProfileWizard";
import type {
  RouterIpPool,
} from "@/features/plan-profiles/data/types";

export function PlanProfileConnectionStep({
  form,
  set,
  routers,
  pools,
  parentQueues,
  queuesLoading,
  queuesMessage,
  router,
  selectedPool,
  selectedParentQueue,
}: {
  form: PlanProfileWizardForm;
  set: SetPlanProfileField;
  routers: Router[];
  pools: RouterIpPool[];
  parentQueues: { id: string; name: string; maxLimit?: string }[];
  queuesLoading?: boolean;
  queuesMessage?: string;
  router: Router | undefined;
  selectedPool: RouterIpPool | undefined;
  selectedParentQueue: { id: string; name: string; maxLimit?: string } | undefined;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Koneksi</h2>
        <p className="text-sm text-muted-foreground">
          Paket ini akan dipasang pada satu router MikroTik.
        </p>
      </div>

      {routers.length === 0 ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400"
        >
          Belum ada router aktif. Tambahkan router terlebih dahulu di menu
          Jaringan.
        </p>
      ) : null}

      <Field>
        <FieldLabel>Router target</FieldLabel>
        <SelectField
          value={form.routerId}
          onValueChange={(value) => set("routerId", value)}
          ariaLabel="Router target"
          placeholder="Pilih router"
          options={routers.map((item) => ({
            value: item.id,
            label: `${item.name} — ${item.host}`,
          }))}
        />
        <FieldDescription>
          Satu profil hanya terikat ke satu router.
        </FieldDescription>
      </Field>

      {router ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
          <div>
            <p className="font-medium">{router.name}</p>
            <p className="text-xs text-muted-foreground">
              {router.host}:{router.apiPort}
            </p>
          </div>
          <StatusBadge tone="success">Aktif</StatusBadge>
        </div>
      ) : null}

      <Field>
        <FieldLabel>Parent queue</FieldLabel>
        <SelectField
          value={form.parentQueueId}
          onValueChange={(value) => set("parentQueueId", value)}
          ariaLabel="Parent queue paket"
          placeholder={
            queuesLoading
              ? "Memuat queue dari router..."
              : parentQueues.length === 0
                ? "Belum ada queue"
                : "Pilih parent queue"
          }
          options={parentQueues.map((queue) => ({
            value: queue.id,
            label: queue.maxLimit
              ? `${queue.name} — ${queue.maxLimit}`
              : queue.name,
          }))}
        />
        <FieldDescription>
          Queue dibaca langsung dari router dan sifatnya opsional.
        </FieldDescription>
      </Field>

      {queuesMessage ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400"
        >
          {queuesMessage}
        </p>
      ) : null}

      {selectedParentQueue ? (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="font-medium">{selectedParentQueue.name}</p>
          <p className="text-xs text-muted-foreground">
            {selectedParentQueue.maxLimit ?? "Tanpa max limit"}
          </p>
        </div>
      ) : null}

      {form.type === "other" ? (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="font-medium">Template simple queue</p>
          <p className="text-xs text-muted-foreground">
            Paket Lainnya dipakai sebagai template simple queue untuk pelanggan
            dengan koneksi static atau DHCP.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Sumber IP pool</p>
              <SelectField
                value={form.poolMode}
                onValueChange={(value) =>
                  set("poolMode", value as PlanProfileWizardForm["poolMode"])
                }
                ariaLabel="Sumber IP pool"
                options={[
                  { value: "existing", label: "Pakai pool yang ada" },
                  { value: "new", label: "Buat pool baru" },
                ]}
              />
            </div>

            {form.poolMode === "existing" ? (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">IP pool</p>
                <SelectField
                  value={form.ipPoolId}
                  onValueChange={(value) => set("ipPoolId", value)}
                  ariaLabel="IP pool"
                  placeholder={
                    pools.length === 0 ? "Belum ada pool" : "Pilih IP pool"
                  }
                  options={pools.map((pool) => ({
                    value: pool.id,
                    label: `${pool.name} — ${pool.rangeStart}–${pool.rangeEnd}`,
                  }))}
                />
              </div>
            ) : null}
          </div>

          {form.poolMode === "existing" ? (
            pools.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Router ini belum memiliki IP pool. Pilih “Buat pool baru”.
              </p>
            ) : selectedPool ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">{selectedPool.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedPool.rangeStart} – {selectedPool.rangeEnd}
                </p>
              </div>
            ) : null
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="pool-name">Nama pool</FieldLabel>
                <Input
                  id="pool-name"
                  value={form.newPoolName}
                  placeholder="PPPoE-JKT-BARU"
                  onChange={(event) => set("newPoolName", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="pool-start">IP awal</FieldLabel>
                <Input
                  id="pool-start"
                  value={form.newPoolStart}
                  placeholder="10.10.30.10"
                  onChange={(event) => set("newPoolStart", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="pool-end">IP akhir</FieldLabel>
                <Input
                  id="pool-end"
                  value={form.newPoolEnd}
                  placeholder="10.10.30.254"
                  onChange={(event) => set("newPoolEnd", event.target.value)}
                />
              </Field>
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="local-address">Local address</FieldLabel>
            <Input
              id="local-address"
              value={form.localAddress}
              placeholder="10.10.10.1"
              onChange={(event) => set("localAddress", event.target.value)}
            />
            <FieldDescription>
              Alamat IP router yang dipakai sebagai gateway profil ini.
            </FieldDescription>
          </Field>
        </>
      )}
    </div>
  );
}
