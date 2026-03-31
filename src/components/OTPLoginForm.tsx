import { FormEvent, useState } from 'react';
import { ArrowRight, KeyRound, Mail } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/auth';
import { UserSession } from '../types';
import { BrandLogo } from './BrandLogo';
import { CardShell } from './CardShell';

interface OTPLoginFormProps {
  onLogin: (session: UserSession) => void;
}

export const OTPLoginForm = ({ onLogin }: OTPLoginFormProps) => {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('Enter your email address to receive an OTP.');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await sendOtp(identifier.trim());
      setStatus(`${result.message} Demo code: ${result.code}`);
      setOtpSent(true);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const session = await verifyOtp(identifier.trim(), otp.trim());
      onLogin(session);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardShell className="mx-auto max-w-md border-blue-100 bg-gradient-to-br from-white/95 via-white/90 to-orange-50/80 shadow-2xl shadow-blue-100/60 dark:from-[#0d0d0d] dark:via-[#111111] dark:to-[#1a120a] dark:shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
      <div className="mb-6 space-y-3">
        <BrandLogo />
        <div className="inline-flex rounded-full bg-blue-100 px-3 py-2 text-black dark:bg-orange-500/15 dark:text-orange-100">
          <Mail size={18} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-clay dark:text-orange-200">Welcome Back</p>
          <h1 className="font-display text-3xl">Discipline AI Tracker</h1>
        </div>
        <p className="muted-text text-sm">
          Secure your routine with email OTP login. SMTP delivery works when configured, and safe demo mode still works out of the box.
        </p>
      </div>

      <form className="space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email address</span>
          <input
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-black outline-none transition focus:border-clay focus:ring-2 focus:ring-blue-100 dark:border-orange-400/25 dark:bg-[#17110b] dark:text-orange-50 dark:focus:ring-orange-500/20"
            placeholder="you@example.com"
          />
        </label>

        {otpSent && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Enter OTP</span>
            <input
              required
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-black outline-none transition focus:border-clay focus:ring-2 focus:ring-blue-100 dark:border-orange-400/25 dark:bg-[#17110b] dark:text-orange-50 dark:focus:ring-orange-500/20"
              placeholder="123456"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-100 px-4 py-3 font-semibold text-black transition hover:bg-blue-200 disabled:opacity-60 dark:bg-orange-500/20 dark:text-orange-50 dark:hover:bg-orange-500/30"
        >
          {otpSent ? <KeyRound size={18} /> : <ArrowRight size={18} />}
          {loading ? 'Please wait...' : otpSent ? 'Verify OTP' : 'Send OTP'}
        </button>
      </form>

      <p className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-black dark:border-orange-400/25 dark:bg-orange-500/10 dark:text-orange-100">
        {status}
      </p>
    </CardShell>
  );
};
