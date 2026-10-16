import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Boxes,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  X,
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'Stationery',
    quantityInStock: 20,
    minAlertQuantity: 10,
    unitPrice: 500,
    unit: 'Pcs',
    location: 'Main Store Room',
  });

  const [movementData, setMovementData] = useState({
    movementType: 'IN',
    quantity: 10,
    referenceNo: '',
    remarks: '',
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInventoryItem(newItem);
      setIsAddItemOpen(false);
      loadInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await api.recordStockMovement({
        inventoryItemId: selectedItem.id,
        ...movementData,
      });
      setIsMovementOpen(false);
      loadInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & Asset Tracking</h2>
          <p className="text-xs text-slate-500">
            Stationery supplies, laboratory equipment, sports gear, and stock movements log
          </p>
        </div>

        <button
          onClick={() => setIsAddItemOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Inventory Item</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const isLowStock = item.quantityInStock <= item.minAlertQuantity;
          return (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.itemCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                      isLowStock ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isLowStock && <AlertTriangle className="w-3 h-3" />}
                    <span>{item.quantityInStock} {item.unit} in Stock</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3">{item.itemName}</h3>
                <p className="text-xs text-slate-500">
                  Category: <strong>{item.category}</strong> • Price: <strong>₨ {Number(item.unitPrice).toLocaleString()}</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Location: {item.location || 'Store Room'}</p>

                {item.movements?.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Movement:</span>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span>{item.movements[0].movementType === 'IN' ? 'Stock Added' : 'Stock Issued'}</span>
                      <span className="font-bold">
                        {item.movements[0].movementType === 'IN' ? '+' : '-'}{item.movements[0].quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t flex justify-end">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsMovementOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs"
                >
                  Record Stock In/Out
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Item */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Register New Inventory Item</h3>
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Sports">Sports</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newItem.quantityInStock}
                    onChange={(e) => setNewItem({ ...newItem, quantityInStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit Price (PKR)</label>
                  <input
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsAddItemOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Stock Movement */}
      {isMovementOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Stock Movement: {selectedItem.itemName}</h3>
            <form onSubmit={handleRecordMovement} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Action Type</label>
                <select
                  value={movementData.movementType}
                  onChange={(e) => setMovementData({ ...movementData, movementType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold text-indigo-700"
                >
                  <option value="IN">Stock In (Purchase / Restock)</option>
                  <option value="OUT">Stock Out (Issued to Department)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Quantity ({selectedItem.unit}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={movementData.quantity}
                  onChange={(e) => setMovementData({ ...movementData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Reference / PO #</label>
                <input
                  type="text"
                  placeholder="e.g. PO-OCT-102"
                  value={movementData.referenceNo}
                  onChange={(e) => setMovementData({ ...movementData, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsMovementOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
