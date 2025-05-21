import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { crm_Opportunities } from "@prisma/client";
import {
  CalendarDays,
  ClipboardList,
  CoinsIcon,
  Combine,
  File,
  Globe,
  Globe2,
  Landmark,
  List,
  Medal,
  MoreHorizontal,
  Percent,
  Phone,
  SquareStack,
  Text,
  User,
} from "lucide-react";
import moment from "moment";
import { Clapperboard } from "lucide-react";
import { prismadb } from "@/lib/prisma";
import Link from "next/link";
import { EnvelopeClosedIcon, LightningBoltIcon } from "@radix-ui/react-icons";
import { LucideLandmark } from "lucide-react";

interface OppsViewProps {
  data: any;
}

export async function BasicView({ data }: OppsViewProps) {
  //console.log(data, "data");
  const users = await prismadb.users.findMany();
  if (!data) return <div>Opportunity not found</div>;
  return (
    <div className="pb-3 space-y-5">
      {/*      <pre>{JSON.stringify(data, null, 2)}</pre> */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex w-full justify-between">
            <div>
              <CardTitle>
                {data.company}
              </CardTitle>
              <CardDescription>ID:{data.id}</CardDescription>
            </div>
            <div>
              {
                //TODO: Add menu
                //TODO: Add edit button
              }
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 w-full gap-5 ">
            <div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Landmark className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Company name</p>
                  <p className="text-sm text-muted-foreground">{data.company}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <List className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Region</p>
                  <p className="text-sm text-muted-foreground">{data.region}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <User className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Contacts</p>
                  <p className="text-sm text-muted-foreground">{data.contacts}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Text className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Memo</p>
                  <p className="text-sm text-muted-foreground">{data.memo}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Medal className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Industry</p>
                  <p className="text-sm text-muted-foreground">{data.industry}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Globe2 className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Website</p>
                  <p className="text-sm text-muted-foreground">{data.website}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Landmark className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Address</p>
                  <p className="text-sm text-muted-foreground">{data.address}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Landmark className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Company Type</p>
                  <p className="text-sm text-muted-foreground">{data.company_type}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Landmark className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Employee Scale</p>
                  <p className="text-sm text-muted-foreground">{data.employee_scale}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Landmark className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Introduction</p>
                  <p className="text-sm text-muted-foreground">{data.introduction}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <User className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Assigned to</p>
                  <p className="text-sm text-muted-foreground">{users.find((user) => user.id === data.assigned_to)?.name}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <CalendarDays className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Created</p>
                  <p className="text-sm text-muted-foreground">{moment(data.created_on).format("MMM DD YYYY")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Created by</p>
                  <p className="text-sm text-muted-foreground">{users.find((user) => user.id === data.createdBy)?.name}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <CalendarDays className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Last update</p>
                  <p className="text-sm text-muted-foreground">{moment(data.updatedAt).format("MMM DD YYYY")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Last update by</p>
                  <p className="text-sm text-muted-foreground">{users.find((user) => user.id === data.updatedBy)?.name}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <LightningBoltIcon className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Status</p>
                  <p className="text-sm text-muted-foreground">{data.status}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <CoinsIcon className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Type</p>
                  <p className="text-sm text-muted-foreground">{data.type}</p>
                </div>
              </div>
              <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <File className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Lead Source Content</p>
                  <pre className="text-xs text-muted-foreground rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(data.lead_source_content), null, 2);
                      } catch {
                        return typeof data.lead_source_content === 'string'
                          ? data.lead_source_content
                          : '';
                      }
                    })()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
