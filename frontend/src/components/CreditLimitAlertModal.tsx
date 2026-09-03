import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { useCreditAlert } from '../contexts/CreditAlertContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { formatCurrency } from '../mockData';

export function CreditLimitAlertModal() {
  const { currentAlert, dismiss } = useCreditAlert();
  const { speak, stop, state, supported } = useSpeechSynthesis();

  const open = !!currentAlert;
  const isBlocked = currentAlert?.kind === 'blocked';

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      stop();
      currentAlert?.onCancel?.();
      dismiss();
    }
  };

  const handleSpeakerClick = () => {
    if (!currentAlert) return;
    if (state === 'speaking') {
      stop();
    } else {
      speak(currentAlert.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {currentAlert && (
        <DialogContent className="sm:max-w-md" aria-describedby="credit-alert-description">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: isBlocked ? 'var(--destructive)' : 'var(--gold, #D97706)', opacity: 0.15 }}
              >
                <AlertTriangle
                  className="w-6 h-6"
                  style={{ color: isBlocked ? 'var(--destructive)' : 'var(--gold, #D97706)' }}
                  aria-hidden="true"
                />
              </div>
              <DialogTitle className="text-left">{currentAlert.title}</DialogTitle>
            </div>
            <DialogDescription id="credit-alert-description" className="text-left pt-1">
              {currentAlert.message}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="text-muted-foreground text-xs">Credit Limit</div>
              <div className="font-display">{formatCurrency(currentAlert.creditLimit)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Available Credit</div>
              <div className="font-display">{formatCurrency(currentAlert.availableCredit)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Current Utilization</div>
              <div className="font-display">{currentAlert.utilizationPct.toFixed(0)}%</div>
            </div>
            {currentAlert.thresholdPct !== undefined && (
              <div>
                <div className="text-muted-foreground text-xs">Warning Threshold</div>
                <div className="font-display">{currentAlert.thresholdPct.toFixed(0)}%</div>
              </div>
            )}
          </div>

          {supported && (
            <button
              type="button"
              onClick={handleSpeakerClick}
              aria-pressed={state === 'speaking'}
              aria-label={state === 'speaking' ? 'Stop reading alert aloud' : 'Read alert aloud'}
              className="fin-btn fin-btn-outline w-fit inline-flex items-center gap-2 text-sm"
            >
              {state === 'speaking' ? (
                <>
                  <VolumeX className="w-4 h-4 animate-pulse" aria-hidden="true" />
                  Stop reading
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  Read aloud
                </>
              )}
            </button>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => {
                stop();
                currentAlert.onCancel?.();
                dismiss();
              }}
            >
              Cancel Transaction
            </Button>
            {currentAlert.kind === 'warning' && currentAlert.onProceed && (
              <Button
                onClick={() => {
                  stop();
                  currentAlert.onProceed?.();
                  dismiss();
                }}
              >
                Proceed Anyway
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
