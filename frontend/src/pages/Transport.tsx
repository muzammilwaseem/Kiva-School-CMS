import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Bus,
  Search,
  Plus,
  Phone,
  Users,
  MapPin,
  X,
} from 'lucide-react';

export const TransportManagement: React.FC = () => {
  const [data, setData] = useState<any>({ vehicles: [], routes: [] });
  const [loading, setLoading] = useState(true);

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: 'KHI-JS-9921',
    vehicleModel: 'Toyota Coaster (30 Seater)',
    capacity: 30,
    driverName: 'Muhammad Arshad',
    driverPhone: '0300-1122445',
    driverLicense: 'KHI-DL-10928',
  });

  const [newRoute, setNewRoute] = useState({
    routeName: 'Route 2: North Nazimabad - Campus',
    startPoint: 'Sakhi Hassan Chowrangi',
    endPoint: 'Campus Main Gate',
    vehicleId: '',
    monthlyFee: 3500,
  });

  useEffect(() => {
    loadTransport();
  }, []);

  const loadTransport = async () => {
    setLoading(true);
    try {
      const res = await api.getTransport();
      setData(res);
      if (res.vehicles?.length > 0) {
        setNewRoute((prev) => ({ ...prev, vehicleId: String(res.vehicles[0].id) }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createVehicle(newVehicle);
      setIsAddVehicleOpen(false);
      loadTransport();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRoute(newRoute);
      setIsAddRouteOpen(false);
      loadTransport();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">School Transport & Van Fleet</h2>
          <p className="text-xs text-slate-500">
            Vehicles, bus drivers, pickup routes, and enrolled student transport allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
          <button
            onClick={() => setIsAddRouteOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Route</span>
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(data.routes || []).map((r: any) => (
          <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bus className="w-4 h-4 text-indigo-600" />
                <span>{r.routeName}</span>
              </span>
              <span className="font-black text-emerald-700 text-xs">
                ₨ {Number(r.monthlyFee).toLocaleString()} /mo
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Start: {r.startPoint} → End: {r.endPoint}</span>
              </p>
              <p>Vehicle: <strong>{r.vehicle?.vehicleNumber} ({r.vehicle?.vehicleModel})</strong></p>
              <p>Driver: <strong>{r.vehicle?.driverName}</strong> (Ph: {r.vehicle?.driverPhone})</p>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-[11px] text-slate-500">
              <span>Capacity: {r.vehicle?.capacity} Passengers</span>
              <span className="font-bold text-indigo-600">{r._count?.students || 0} Students Assigned</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Vehicle */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Add New Fleet Vehicle</h3>
            <form onSubmit={handleCreateVehicle} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Registration Plate # *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KHI-AB-1234"
                  value={newVehicle.vehicleNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Model & Make</label>
                <input
                  type="text"
                  required
                  value={newVehicle.vehicleModel}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicleModel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.driverName}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Driver Phone *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.driverPhone}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driverPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsAddVehicleOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Route */}
      {isAddRouteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Add New Transport Route</h3>
            <form onSubmit={handleCreateRoute} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Route Title *</label>
                <input
                  type="text"
                  required
                  value={newRoute.routeName}
                  onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start Landmark</label>
                  <input
                    type="text"
                    value={newRoute.startPoint}
                    onChange={(e) => setNewRoute({ ...newRoute, startPoint: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Monthly Fee (PKR)</label>
                  <input
                    type="number"
                    value={newRoute.monthlyFee}
                    onChange={(e) => setNewRoute({ ...newRoute, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Assigned Vehicle</label>
                <select
                  value={newRoute.vehicleId}
                  onChange={(e) => setNewRoute({ ...newRoute, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                >
                  {(data.vehicles || []).map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNumber} ({v.vehicleModel})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsAddRouteOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
