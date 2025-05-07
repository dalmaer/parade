/**
 * Represents a conversation with a model
 */
export class Conversation {
  /**
   * @param {Object} options - Conversation options
   * @param {string} options.systemPrompt - The system prompt to use for the conversation
   */
  constructor(options = {}) {
    this.messages = [];
    
    if (options.systemPrompt) {
      this.addSystemMessage(options.systemPrompt);
    }
  }

  /**
   * Add a system message to the conversation
   * @param {string} content - The message content
   */
  addSystemMessage(content) {
    this.messages.push({
      role: 'system',
      content
    });
  }

  /**
   * Add a user message to the conversation
   * @param {string} content - The message content
   */
  addUserMessage(content) {
    this.messages.push({
      role: 'user',
      content
    });
  }

  /**
   * Add an assistant message to the conversation
   * @param {string} content - The message content
   */
  addAssistantMessage(content) {
    this.messages.push({
      role: 'assistant',
      content
    });
  }

  /**
   * Get all messages in the conversation
   * @returns {Array<Object>} The messages
   */
  getMessages() {
    return [...this.messages];
  }

  /**
   * Clear the conversation history (except system message)
   */
  clear() {
    const systemMessages = this.messages.filter(m => m.role === 'system');
    this.messages = [...systemMessages];
  }
}
