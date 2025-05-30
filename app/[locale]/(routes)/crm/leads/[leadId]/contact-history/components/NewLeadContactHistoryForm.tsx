"use client";

import React, { useState, useEffect } from 'react'

const contactMethods = [
  '电话',
  '微信',
  'QQ',
  '短信',
  '邮件',
  '拜访',
  '其它',
]

const contactResults = [
  '电话打通有意向',
  '电话打通加V沟通',
  '电话打通加Q沟通',
  '电话打通已约拜访',
  '电话打通无兴趣',
  '持续忙音',
  '无人接听',
  '拒接/挂断',
  '号码为空号',
]

function getNowDatetimeLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export default function NewLeadContactHistoryForm({ leadId, onSuccess }: { leadId: string, onSuccess?: () => void }) {
  const [form, setForm] = useState({
    contact_time: getNowDatetimeLocal(),
    contact_method: contactMethods[0],
    contact_value: '',
    contact_result: '',
    custom_result: '',
    memo: '',
    lead_contact_id: '',
  })
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch(`/api/crm/leads/${leadId}`)
      .then(res => res.json())
      .then(data => {
        setContacts(Array.isArray(data.contacts) ? data.contacts : [])
      })
  }, [leadId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleResultChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setForm({ ...form, contact_result: e.target.value, custom_result: '' })
  }

  const handleCustomResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, contact_result: '', custom_result: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    if (!form.lead_contact_id) {
      setError('请选择联系人')
      setLoading(false)
      return
    }
    try {
      const result = form.custom_result || form.contact_result
      const res = await fetch(`/api/crm/leads/${leadId}/contact-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, contact_result: result }),
      })
      if (!res.ok) throw new Error('提交失败')
      setSuccess('提交成功')
      setForm({ contact_time: getNowDatetimeLocal(), contact_method: contactMethods[0], contact_value: '', contact_result: '', custom_result: '', memo: '', lead_contact_id: '' })
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || '未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-bold mb-2">新增跟进记录</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select name="lead_contact_id" value={form.lead_contact_id} onChange={handleChange} required className="border rounded px-2 py-1 w-full">
          <option value="">请选择联系人</option>
          {contacts.map(c => {
            const arr = [];
            if (c.name) arr.push(c.name);
            if (c.phone) arr.push(c.phone);
            if (c.email) arr.push(c.email);
            return (
              <option key={c.id} value={c.id}>{arr.join(', ') || c.id}</option>
            );
          })}
        </select>
        <input type="datetime-local" name="contact_time" value={form.contact_time} onChange={handleChange} required className="border rounded px-2 py-1 w-full" />
        <select name="contact_method" value={form.contact_method} onChange={handleChange} required className="border rounded px-2 py-1 w-full">
          {contactMethods.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <input type="text" name="contact_value" value={form.contact_value} onChange={handleChange} placeholder="联系号码/邮箱" required className="border rounded px-2 py-1 w-full" />
        <div className="flex gap-2">
          <select name="contact_result" value={form.contact_result} onChange={handleResultChange} className="border rounded px-2 py-1 w-full">
            <option value="">请选择联系结果</option>
            {contactResults.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <input type="text" name="custom_result" value={form.custom_result} onChange={handleCustomResultChange} placeholder="自定义结果" className="border rounded px-2 py-1 w-full" />
        </div>
        <textarea name="memo" value={form.memo} onChange={handleChange} placeholder="备忘" className="border rounded px-2 py-1 w-full" />
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded shadow font-semibold">
            {loading ? '提交中...' : '提交'}
          </button>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
      </form>
    </div>
  )
} 