import React from 'react';
import { EmailGatewayModal } from './EmailGatewayModal';
import { SMSProviderStatus } from '../services/backendApi';

interface SmsGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: (status: SMSProviderStatus) => void;
}

/**
 * Adapter component redirecting legacy SMS Gateway calls to the modern,
 * real Gmail SMTP Email Gateway.
 */
export const SmsGatewayModal: React.FC<SmsGatewayModalProps> = ({
  isOpen,
  onClose,
  onStatusChanged,
}) => {
  return (
    <EmailGatewayModal
      isOpen={isOpen}
      onClose={onClose}
      onStatusChanged={(s) => {
        if (onStatusChanged) {
          onStatusChanged({
            ...s,
            is_live_telecom: s.is_configured,
            configured_provider: s.is_configured ? 'gmail_smtp' : 'sandbox',
          });
        }
      }}
    />
  );
};
