export interface MailVars {
  [key: string]: string;
}

/**
 * 统一模板变量填充
 * 优先级：vars > contact > lead
 */
export function fillTemplate(
  template: string,
  lead: Record<string, any>,
  vars: MailVars = {},
  contact?: Record<string, any>
): string {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => {
    if (vars[key] !== undefined) return vars[key];
    if (contact && contact[key] !== undefined) return contact[key];
    if (lead && lead[key] !== undefined) return lead[key];
    return '';
  });
}

/**
 * 自动组装常用变量（SENDER/MOBILE 来源于 autoMailer）
 */
export function getMailVars(contact: any, autoMailer: any, language?: string) {
  return {
    APPELLATION: contact?.appellation || '',
    SENDER: language === 'en' ? (autoMailer?.mail_from_name_en || '') : (autoMailer?.mail_from_name_cn || ''),
    MOBILE: autoMailer?.contact_no || '',
  };
}

/**
 * 统一获取发件人信息
 * @param autoMailer auto_mailer_configs 配置对象
 * @param language 语言，用于选择对应的发件人名称
 * @returns 发件人信息对象
 */
export function getSender(autoMailer: any, language?: string) {
  if (!autoMailer) {
    return {
      senderName: '',
      senderMobile: '',
      from: '',
      fromName: '',
    };
  }

  const fromName = language === 'en' 
    ? (autoMailer.mail_from_name_en || '') 
    : (autoMailer.mail_from_name_cn || '');

  return {
    senderName: fromName,
    senderMobile: autoMailer.contact_no || '',
    from: autoMailer.mail_address || '',
    fromName: fromName,
  };
} 