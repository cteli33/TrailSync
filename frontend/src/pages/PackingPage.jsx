import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import Avatar from "../components/Avatar";
import { CheckIcon, PlusIcon, TrashIcon, XIcon } from "../components/Icons";

function groupByCategory(items) {
  const groups = {};
  for (const item of items) {
    const key = item.category || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function PackingPage() {
  const { trip } = useOutletContext();
  const { user } = useAuth();
  const [tab, setTab] = useState("group");
  const [groupItems, setGroupItems] = useState([]);
  const [individualItems, setIndividualItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  async function loadAll() {
    setLoading(true);
    try {
      const [group, individual] = await Promise.all([
        api.listGroupPacking(trip.id),
        api.listIndividualPacking(trip.id, user.id),
      ]);
      setGroupItems(group);
      setIndividualItems(individual);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="section-heading">
        <h2>Packing Lists</h2>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === "group" ? " active" : ""}`} onClick={() => setTab("group")}>
          Group Gear
        </button>
        <button
          className={`tab-btn${tab === "individual" ? " active" : ""}`}
          onClick={() => setTab("individual")}
        >
          My Packing List
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--gray-500)" }}>Loading packing lists…</p>
      ) : tab === "group" ? (
        <GroupPacking items={groupItems} tripId={trip.id} userId={user.id} onChanged={loadAll} />
      ) : (
        <IndividualPacking items={individualItems} tripId={trip.id} userId={user.id} onChanged={loadAll} />
      )}
    </div>
  );
}

function GroupPacking({ items, tripId, userId, onChanged }) {
  async function togglePacked(item) {
    await api.updatePackingItem(item.id, { is_packed: !item.is_packed });
    onChanged();
  }

  async function claim(item) {
    await api.claimPackingItem(item.id, userId, true);
    onChanged();
  }

  async function unclaim(item) {
    await api.claimPackingItem(item.id, userId, false);
    onChanged();
  }

  async function remove(item) {
    if (!window.confirm(`Remove "${item.name}" from group gear?`)) return;
    await api.deletePackingItem(item.id);
    onChanged();
  }

  const groups = groupByCategory(items);

  return (
    <div>
      {groups.map(([category, catItems]) => (
        <div className="category-group" key={category}>
          <p className="category-title">{category}</p>
          {catItems.map((item) => {
            const claimedByMe = item.claimed_by?.id === userId;
            return (
              <div className={`packing-item-row${item.is_packed ? " packed" : ""}`} key={item.id}>
                {claimedByMe ? (
                  <div
                    className={`checkbox${item.is_packed ? " checked" : ""}`}
                    onClick={() => togglePacked(item)}
                  >
                    {item.is_packed && <CheckIcon width={13} height={13} />}
                  </div>
                ) : (
                  <div className="checkbox" style={{ opacity: 0.3, cursor: "default" }} />
                )}
                <div className="packing-item-info">
                  <span className="packing-item-name">{item.name}</span>
                  {item.quantity > 1 && <span className="packing-item-qty">×{item.quantity}</span>}
                </div>
                <div className="claim-area">
                  {item.claimed_by ? (
                    <>
                      <div className="claimed-chip">
                        <Avatar name={item.claimed_by.name} color={item.claimed_by.avatar_color} size="avatar-sm" />
                        {claimedByMe ? "You're bringing this" : item.claimed_by.name}
                      </div>
                      {claimedByMe && (
                        <button className="icon-btn" title="Unclaim" onClick={() => unclaim(item)}>
                          <XIcon width={14} height={14} />
                        </button>
                      )}
                    </>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={() => claim(item)}>
                      Claim
                    </button>
                  )}
                  <button className="icon-btn" title="Remove item" onClick={() => remove(item)}>
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {items.length === 0 && (
        <div className="empty-state">
          <h3>No group gear yet</h3>
          <p>Add shared items like tents, stoves, or safety gear below.</p>
        </div>
      )}
      <AddItemForm
        onAdd={async (form) => {
          await api.createPackingItem(tripId, { ...form, scope: "group" });
          onChanged();
        }}
      />
    </div>
  );
}

function IndividualPacking({ items, tripId, userId, onChanged }) {
  async function togglePacked(item) {
    await api.updatePackingItem(item.id, { is_packed: !item.is_packed });
    onChanged();
  }

  async function remove(item) {
    await api.deletePackingItem(item.id);
    onChanged();
  }

  const groups = groupByCategory(items);
  const packedCount = items.filter((i) => i.is_packed).length;

  return (
    <div>
      {items.length > 0 && (
        <p style={{ color: "var(--gray-500)", fontSize: 13.5, marginBottom: 14 }}>
          {packedCount} of {items.length} packed
        </p>
      )}
      {groups.map(([category, catItems]) => (
        <div className="category-group" key={category}>
          <p className="category-title">{category}</p>
          {catItems.map((item) => (
            <div className={`packing-item-row${item.is_packed ? " packed" : ""}`} key={item.id}>
              <div
                className={`checkbox${item.is_packed ? " checked" : ""}`}
                onClick={() => togglePacked(item)}
              >
                {item.is_packed && <CheckIcon width={13} height={13} />}
              </div>
              <div className="packing-item-info">
                <span className="packing-item-name">{item.name}</span>
                {item.quantity > 1 && <span className="packing-item-qty">×{item.quantity}</span>}
              </div>
              <button className="icon-btn" title="Remove item" onClick={() => remove(item)}>
                <TrashIcon width={14} height={14} />
              </button>
            </div>
          ))}
        </div>
      ))}
      {items.length === 0 && (
        <div className="empty-state">
          <h3>Your list is empty</h3>
          <p>Add personal gear like boots, layers, or a sleeping bag below.</p>
        </div>
      )}
      <AddItemForm
        onAdd={async (form) => {
          await api.createPackingItem(tripId, { ...form, scope: "individual", owner_user_id: userId });
          onChanged();
        }}
      />
    </div>
  );
}

function AddItemForm({ onAdd }) {
  const [form, setForm] = useState({ name: "", category: "", quantity: 1 });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd({
        name: form.name,
        category: form.category || "Other",
        quantity: Number(form.quantity) || 1,
      });
      setForm({ name: "", category: "", quantity: 1 });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-add-row">
      <label>
        Item
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Water filter"
          required
        />
      </label>
      <label>
        Category
        <input
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          placeholder="e.g. Gear"
        />
      </label>
      <label style={{ maxWidth: 90 }}>
        Qty
        <input
          type="number"
          min="1"
          value={form.quantity}
          onChange={(e) => update("quantity", e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
        <PlusIcon width={14} height={14} /> Add
      </button>
    </form>
  );
}
