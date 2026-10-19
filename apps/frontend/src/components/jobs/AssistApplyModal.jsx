import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

function isValidHttpUrl(string) {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function AssistApplyModal({ job, isOpen, onClose }) {
  const [extensionStatus, setExtensionStatus] = useState('checking'); // 'checking' | 'ready' | 'missing'
  const [hasLaunched, setHasLaunched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const jobUrl = job?.jobUrl;
  const isUrlValid = isValidHttpUrl(jobUrl);

  useEffect(() => {
    if (!isOpen || !job) {
      setHasLaunched(false);
      setErrorMessage('');
      setExtensionStatus('checking');
      return;
    }

    if (!isUrlValid) {
      setErrorMessage(
        jobUrl
          ? `The saved job URL "${jobUrl}" is not a valid HTTP/HTTPS web address.`
          : 'This job does not have an original application URL. Please add a valid link first.'
      );
      setExtensionStatus('missing');
      return;
    }

    let isSubscribed = true;
    let timeoutId;

    // Listen for pong from CareerOS extension content script
    const handleMessage = (event) => {
      if (event.data?.type === 'CAREEROS_EXTENSION_PONG') {
        if (isSubscribed) {
          setExtensionStatus('ready');
          // Signal extension with intended job data
          window.postMessage(
            {
              type: 'CAREEROS_ASSIST_APPLY_INITIATE',
              payload: {
                jobId: job._id,
                jobUrl: job.jobUrl,
                company: job.company,
                jobTitle: job.jobTitle,
              },
            },
            '*'
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Ping extension
    window.postMessage({ type: 'CAREEROS_EXTENSION_PING' }, '*');

    // Timeout fallback if extension is not installed or not active on this origin
    timeoutId = setTimeout(() => {
      if (isSubscribed && extensionStatus === 'checking') {
        setExtensionStatus('missing');
      }
    }, 700);

    // Automatically launch job tab once
    try {
      window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
      setHasLaunched(true);
    } catch {
      setErrorMessage('Browser blocked opening the job tab. Please allow popups or click the button below.');
    }

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, job, isUrlValid, jobUrl]);

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-base font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Assisted Apply
              </h3>
              <p className="text-xs text-slate-500">
                {job.company} &bull; {job.jobTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMessage ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Cannot Launch Assisted Apply</span>
              </div>
              <p>{errorMessage}</p>
            </div>
          ) : (
            <>
              {/* Extension Status Callout */}
              {extensionStatus === 'ready' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                  <span className="text-sm">🟢</span>
                  <div>
                    <div className="font-semibold">CareerOS Extension Connected</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      The job page was opened in a new tab. The in-page assistant is detecting form fields automatically.
                    </div>
                  </div>
                </div>
              )}

              {extensionStatus === 'missing' && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                  <span className="text-sm">🟡</span>
                  <div>
                    <div className="font-semibold">Extension Not Detected On This Page</div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                      The job page was opened. If you have the CareerOS Chrome Extension installed, open the extension in your browser toolbar on that tab to autofill.
                    </div>
                  </div>
                </div>
              )}

              {/* Step progression workflow */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Assisted Apply Workflow
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">Application page opened:</strong> Destination job portal is loaded in your browser.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">Review & Autofill:</strong> The CareerOS drawer maps your verified profile and resume without touching sensitive legal fields.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">Submit & Confirm:</strong> Submit the external form, then click <em>"Confirm Applied & Track"</em> in the extension.
                    </span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <Link to="/applications" onClick={onClose}>
            <Button variant="ghost" size="sm" className="text-xs">
              Go to Applications Dashboard &rarr;
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {isUrlValid && (
              <a href={jobUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  Re-open Tab
                </Button>
              </a>
            )}
            <Button variant="primary" size="sm" onClick={onClose} className="text-xs">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssistApplyModal;
