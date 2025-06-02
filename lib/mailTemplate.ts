import setting from '@/jobs/setting.json';

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
export function getMailVars(contact: any, autoMailer: any) {
  return {
    APPELLATION: contact?.appellation || '',
    SENDER: autoMailer?.mail_from_name_cn || '',
    MOBILE: autoMailer?.contact_no || '',
  };
} 