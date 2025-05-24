import { MessageType, MessageResponse } from '../../shared/types';
import { MESSAGE_ACTIONS } from '../../shared/constants/messages';
import { handleError } from '../../shared/utils/error-handling';
import { SessionHandler } from '../handlers/session-handler';

export class MessageService {
  private sessionHandler = new SessionHandler();

  handleMessage(
    message: MessageType,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ): boolean {
    this.processMessage(message, sendResponse).catch((error) => {
      const errorMessage = handleError(error, 'MessageService.handleMessage');
      sendResponse({ success: false, error: errorMessage });
    });

    return true;
  }

  private async processMessage(message: MessageType, sendResponse: (response: MessageResponse) => void): Promise<void> {
    switch (message.action) {
      case MESSAGE_ACTIONS.GET_CURRENT_SESSION:
        await this.handleGetCurrentSession(message, sendResponse);
        break;

      case MESSAGE_ACTIONS.SWITCH_SESSION:
        await this.handleSwitchSession(message, sendResponse);
        break;

      case MESSAGE_ACTIONS.CLEAR_SESSION:
        await this.handleClearSession(message, sendResponse);
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  private async handleGetCurrentSession(
    message: Extract<MessageType, { action: 'getCurrentSession' }>,
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    const sessionData = await this.sessionHandler.getCurrentSession(message.domain, message.tabId);
    sendResponse({ success: true, data: sessionData });
  }

  private async handleSwitchSession(
    message: Extract<MessageType, { action: 'switchSession' }>,
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    await this.sessionHandler.switchToSession(message.sessionData, message.tabId);
    sendResponse({ success: true });
  }

  private async handleClearSession(
    message: Extract<MessageType, { action: 'clearSession' }>,
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    await this.sessionHandler.clearSession(message.domain, message.tabId);
    sendResponse({ success: true });
  }
}
