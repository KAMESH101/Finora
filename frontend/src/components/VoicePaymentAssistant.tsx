import { useEffect, useState } from 'react';
import { Mic, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useCreditAlert } from '../contexts/CreditAlertContext';
import { searchContacts, ApiContact } from '../utils/contactsAPI';
import { parseVoiceIntent, payViaVoice, PayResult } from '../utils/voicePaymentAPI';
import { verifyFace } from '../utils/faceAPI';
import { syncWalletFromServer } from '../utils/walletManager';
import { formatCurrency } from '../mockData';

type Step =
  | 'consent'
  | 'verifying_face'
  | 'face_verified'
  | 'face_not_enrolled'
  | 'face_mismatch'
  | 'listening'
  | 'parsing'
  | 'no_match'
  | 'multi_match'
  | 'confirm'
  | 'pin_entry'
  | 'processing'
  | 'success'
  | 'error';

export function VoicePaymentAssistant({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('consent');
  const [errorText, setErrorText] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [matches, setMatches] = useState<ApiContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ApiContact | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [result, setResult] = useState<PayResult | null>(null);
  const [typedCommand, setTypedCommand] = useState('');
  const [faceToken, setFaceToken] = useState<string | null>(null);

  const {
    start,
    transcript,
    interimTranscript,
    error: speechError,
    supported: speechSupported,
  } = useSpeechRecognition();
  const { speak } = useSpeechSynthesis();
  const { showBlocked } = useCreditAlert();

  // STEP 1: face verification — backend-authoritative (issues a real,
  // short-lived, purpose-scoped token; no client-asserted boolean is
  // trusted downstream). No live camera capture is required client-side,
  // so a demo never breaks on camera/permission issues on presentation
  // hardware — but the match/no-match decision and token come from the server.
  useEffect(() => {
    if (step !== 'verifying_face') return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await verifyFace();
        if (cancelled) return;
        if (!res.matched) {
          if (res.reason === 'not_enrolled') {
            setStep('face_not_enrolled');
          } else {
            setStep('face_mismatch');
            speak('Face not matched. Please try again.');
          }
          return;
        }
        setFaceToken(res.token);
        setStep('face_verified');
        speak('Face verified successfully.');
      } catch (e) {
        if (cancelled) return;
        setErrorText(e instanceof Error ? e.message : 'Unable to verify your identity right now.');
        setStep('error');
      }
    }, 1200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [step]);

  useEffect(() => {
    if (step !== 'face_verified') return;
    const t = setTimeout(() => setStep('listening'), 900);
    return () => clearTimeout(t);
  }, [step]);

  const processTranscript = async (text: string) => {
    setStep('parsing');
    try {
      const intent = await parseVoiceIntent(text);
      if (intent.intent !== 'SEND_PAYMENT' || !intent.amount || !intent.recipient_name) {
        setErrorText(`Couldn't understand "${text}". Try "Send 500 to Dinesh".`);
        setStep('error');
        return;
      }
      setAmount(intent.amount);
      setRecipientQuery(intent.recipient_name);

      const res = await searchContacts(intent.recipient_name);
      if (res.matches.length === 0) {
        setStep('no_match');
      } else if (res.matches.length === 1) {
        setSelectedContact(res.matches[0]);
        setStep('confirm');
      } else {
        setMatches(res.matches);
        setStep('multi_match');
      }
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : 'Something went wrong understanding your command.');
      setStep('error');
    }
  };

  useEffect(() => {
    if (step !== 'listening') return;
    start(processTranscript);
  }, [step]);

  useEffect(() => {
    if (speechError && step === 'listening') {
      setErrorText(speechError);
      setStep('error');
    }
  }, [speechError, step]);

  const handleConfirm = () => setStep('pin_entry');

  const handlePinSubmit = async () => {
    if (!selectedContact || !amount) return;
    setPinError('');
    setStep('processing');
    try {
      const res = await payViaVoice({ contact_id: selectedContact.id, amount, pin, face_token: faceToken });
      setResult(res);
      setStep('success');
      syncWalletFromServer().catch(() => {});
    } catch (e: any) {
      if (e?.status === 422) {
        showBlocked({
          title: 'Payment Blocked',
          message: e.message || 'Insufficient balance for this transaction.',
          creditLimit: 0,
          currentBalance: 0,
          availableCredit: 0,
          utilizationPct: 0,
        });
        setStep('confirm');
        return;
      }
      setPinError(e instanceof Error ? e.message : 'Incorrect PIN. Please try again.');
      setPin('');
      setStep('pin_entry');
    }
  };

  const showTypedFallback = step === 'listening' || step === 'error';

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="voice-pay-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" /> Voice Payment
          </DialogTitle>
          <DialogDescription id="voice-pay-description">
            Pay a saved contact using your voice, verified end to end.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[220px] flex flex-col items-center justify-center gap-4 text-center py-4">
          {step === 'consent' && (
            <>
              <ShieldCheck className="w-12 h-12" style={{ color: 'var(--money-in)' }} />
              <p>Verify your identity before making a voice payment.</p>
              <Button onClick={() => setStep('verifying_face')}>Start Verification</Button>
            </>
          )}

          {step === 'verifying_face' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin" />
              <p>Verifying your identity...</p>
            </>
          )}

          {step === 'face_verified' && (
            <>
              <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--money-in)' }} />
              <p>Face verified successfully.</p>
            </>
          )}

          {step === 'face_not_enrolled' && (
            <>
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p>You haven't enrolled face verification yet. Set it up in Settings → Security first.</p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </>
          )}

          {step === 'face_mismatch' && (
            <>
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p>Face not matched. Please try again.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => setStep('verifying_face')}>Retry</Button>
              </div>
            </>
          )}

          {step === 'listening' && (
            <>
              <div className="relative">
                <Mic className="w-12 h-12 animate-pulse" style={{ color: 'var(--money-in)' }} />
              </div>
              <p>Listening... say "Send 500 to Dinesh"</p>
              {interimTranscript && (
                <p className="text-sm text-muted-foreground italic">"{interimTranscript}"</p>
              )}
              {!speechSupported && (
                <p className="text-destructive text-sm">
                  Voice recognition is not supported in this browser — type your command below instead.
                </p>
              )}
            </>
          )}

          {step === 'parsing' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin" />
              <p>Understanding "{transcript || typedCommand}"...</p>
            </>
          )}

          {step === 'no_match' && (
            <>
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p>No contact found matching "{recipientQuery}".</p>
              <Button variant="outline" onClick={() => setStep('listening')}>
                Try Again
              </Button>
            </>
          )}

          {step === 'multi_match' && (
            <div className="w-full space-y-2 text-left">
              <p className="text-center mb-2">Multiple contacts match "{recipientQuery}" — select one:</p>
              {matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedContact(m);
                    setStep('confirm');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="text-2xl">{m.avatar}</span>
                  <div>
                    <div>{m.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.mobile_last4 ? `••••${m.mobile_last4}` : m.upi_id}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'confirm' && selectedContact && amount && (
            <>
              <p className="text-lg">
                Send {formatCurrency(amount)} to <strong>{selectedContact.name}</strong>
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm}>Confirm Payment</Button>
              </div>
            </>
          )}

          {step === 'pin_entry' && (
            <>
              <p>Enter your transaction PIN to complete this payment.</p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-32 text-center text-2xl tracking-widest border rounded-lg px-3 py-2 bg-background"
                style={{ borderColor: 'var(--border)' }}
                autoFocus
              />
              {pinError && <p className="text-destructive text-sm">{pinError}</p>}
              <Button onClick={handlePinSubmit} disabled={pin.length < 4}>
                Submit
              </Button>
            </>
          )}

          {step === 'processing' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin" />
              <p>Processing payment...</p>
            </>
          )}

          {step === 'success' && result && (
            <>
              <CheckCircle2 className="w-16 h-16 fin-pop-in" style={{ color: 'var(--money-in)' }} />
              <p className="text-lg">✓ Payment Successful</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Recipient: {result.recipient.name}</div>
                <div>Amount: {formatCurrency(result.amount)}</div>
                <div>Reference: {result.reference_id}</div>
                <div>New balance: {formatCurrency(result.new_balance)}</div>
              </div>
              <Button onClick={onClose}>Return to Wallet</Button>
            </>
          )}

          {step === 'error' && (
            <>
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p>{errorText || 'Something went wrong.'}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => setStep('listening')}>Try Again</Button>
              </div>
            </>
          )}

          {showTypedFallback && (
            <form
              className="w-full flex gap-2 pt-2 border-t"
              style={{ borderColor: 'var(--border)' }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!typedCommand.trim()) return;
                processTranscript(typedCommand.trim());
              }}
            >
              <input
                type="text"
                placeholder='Or type: "Send 500 to Dinesh"'
                value={typedCommand}
                onChange={(e) => setTypedCommand(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 bg-background text-sm"
                style={{ borderColor: 'var(--border)' }}
              />
              <Button type="submit" size="icon" variant="outline" aria-label="Send typed command">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
