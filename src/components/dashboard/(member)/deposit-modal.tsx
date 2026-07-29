import React, { useState } from 'react';
import { Modal } from '../../ui/modal';
import { Button } from '../../ui/button';
import { DollarSign } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; paymentMethod: string; transactionId: string; type: string; remarks?: string }) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [type, setType] = useState('meal_cash');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit({
      amount: Number(amount),
      paymentMethod,
      transactionId,
      type,
      remarks,
    });
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment Deposit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Amount (BDT)</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="number"
              required
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Deposit Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-hidden focus:border-emerald-500"
          >
            <option value="meal_cash">Meal Cash</option>
            <option value="utility">Utility Share</option>
            <option value="weekly_payment">Weekly Payment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-hidden focus:border-emerald-500"
          >
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash Handover</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">TrxID / Reference</label>
          <input
            type="text"
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. TRX12345678"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Remarks (Optional)</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. November 1st week deposit"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" isLoading={loading} className="w-full">
            Submit Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
