# 导入数据（在 build 目录，已操作）
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 五金.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 化工产品.xlsx"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 家具采购商名录.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 家居装饰品.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 建材.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 日用品买家.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 日用消费品.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 服装.xlsx"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 机械.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 汽车.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 照明.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 玩具.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 电子及信息.xls”
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 电子及家电类.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 鞋.xls"
npx ts-node prisma/seeds/gjh-135.ts "D:\Data\leads\liuzong\117届广交会国外采购商完整版名录\117届广交会国外采购商完整名录\117届广交会国外采购商完整名录\第117届广交会 食品及土特产品类.xls"


# 印尼 邮件

## 发送条件
有有效运价：目的地为印尼且未过期的运价
有邮件模板：第9步的激活状态模板
有目标客户：印尼地区且有有效邮箱的客户
发送频率控制：同一天内不重复发送
状态过滤：排除发送失败的客户（在 ['sent', 'open', 'replied'] 中）
（优先发送没有发生过的？按发送时间排序？）

## 限制条件
每次最多处理100个客户
只处理印尼地区的客户
只处理有有效邮箱的客户
避免同一天重复发送

## 多语言处理
根据客户语言偏好选择对应模板
英文客户使用英文模板，其他使用中文模板
发件人姓名也根据语言显示对应版本

docker exec -it nextcrm-vv node jobs/mail_step_9.js 100
- node jobs/mail_step_9.js 100
- node dist/mail_step_9.js 100


2025-08-29 开始，每天 200 封，直至完成一轮，

接着，每天 500 封，直至完成一轮，

接着，每天 500 封，直至完成一轮，

接着，每天 1000 封，直至完成一轮，


# 发送邮件队列中的邮件
# 早上 9:33 分发送（印尼时间比北京时间晚一小时）
docker exec -it nextcrm-vv node jobs/mail_queue_worker.js 50
- node jobs/mail_queue_worker.js 50
- node dist/mail_queue_worker.js 50
