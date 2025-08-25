import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { usd } from "./lib/utils"
import { Input } from "./components/ui/input"

interface Customer {
  id: string
  name: string
  claimImpact: number,
  defaultEnrolled: boolean,
}

interface TargetResource {
  id: string
  name: string
  description: string
  assignedCustomers: Customer[]
  costPerInterval?: number,
  annualIntervals?: number,
  isAltResource: boolean,
  isGovtPlan?: boolean,
}

const initialCustomers: Customer[] = [
  { id: "1", name: "John Smith", claimImpact: 15000 , defaultEnrolled: true },
  { id: "2", name: "Sarah Johnson", claimImpact: 102000 , defaultEnrolled: true },
  { id: "3", name: "Mike Davis", claimImpact: 1000, defaultEnrolled: true },
  { id: "4", name: "Emily Chen", claimImpact: 1000, defaultEnrolled: true },
  { id: "5", name: "David Wilson", claimImpact: 1000, defaultEnrolled: false },
]

const initialTargetResources: TargetResource[] = [
  {
    id: "resource-1",
    name: "◯ Employee",
    description: "",
    isAltResource: false,
    assignedCustomers: [],
  },
  {
    id: "resource-2",
    name: "◯ Family",
    description: "",
    isAltResource: false,
    assignedCustomers: [],
  },
  {
    id: "resource-3",
    name: "⬤ Medicare",
    description: "",
    isAltResource: true,
    isGovtPlan: true,
    costPerInterval: 421,
    annualIntervals: 12,
    assignedCustomers: []
  },
  {
    id: "resource-4",
    name: "⬤ Alternative Employer",
    description: "Kroger 2026 Gold Tier",
    isAltResource: true,
    costPerInterval: 54.12,
    annualIntervals: 26,
    assignedCustomers: [],
  }
]

const initialTools: FinancialTool[] = [
  {
    name: 'Flat Opt-out Credit',
    isUsed: false,
    optOutTotal: 0,
    singleCredit: 6000,
    multiCredit: 12000,
  }
]

function CustomerCard({customer, isDragged, onToggle}: {customer: Customer, isDragged: boolean | undefined, onToggle: () => void}) {
  return <Card
    className={`p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
    isDragged ? "opacity-50 scale-95" : ""
  }`}>
    <div className="font-medium text-card-foreground">{customer.name}</div>
    <div className="flex items-center gap-6">
      <Label htmlFor={customer.id + '-defenr'}>Default Enrolled</Label>
      <Checkbox id={customer.id + '-defenr'} defaultChecked={customer.defaultEnrolled} onClick={onToggle} />
    </div>
    {customer.defaultEnrolled ?
      <div className="flex items-center gap-6">
        <p className="text-sm text-muted-foreground">Claim Impact: </p>
        <div className="text-sm text-muted-foreground">{usd.format(customer.claimImpact).slice(0,-3)}</div>
      </div>
      : ''
    }
  </Card>
}

export default function DragDropApp() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [targetResources, setTargetResources] = useState<TargetResource[]>(initialTargetResources)
  const [draggedCustomer, setDraggedCustomer] = useState<Customer | null>(null)
  const [dragOverResource, setDragOverResource] = useState<string | null>(null)
  const [override, setOverride] = useState<boolean>(false);

  const handleDragStart = (customer: Customer) => {
    setDraggedCustomer(customer)
  }

  const handleDragEnd = () => {
    setDraggedCustomer(null)
    setDragOverResource(null)
  }

  const handleDragOver = (e: React.DragEvent, resourceId: string) => {
    e.preventDefault()
    setDragOverResource(resourceId)
  }

  const handleDragLeave = () => {
    setDragOverResource(null)
  }

  const handleDrop = (e: React.DragEvent, resourceId: string) => {
    e.preventDefault()

    if (!draggedCustomer) return

    // Remove customer from unassigned list
    setCustomers((prev) => prev.filter((c) => c.id !== draggedCustomer.id))

    // Add customer to target resource
    setTargetResources((prev) =>
      prev.map((resource) => {
        if (resource.id === resourceId) {
          return {
            ...resource,
            assignedCustomers: [...resource.assignedCustomers, draggedCustomer],
          }
        }
        return resource
      }),
    )

    setDraggedCustomer(null)
    setDragOverResource(null)
  }

  const handleRemoveCustomer = (customerId: string, resourceId: string) => {
    // Find the customer to remove
    const resource = targetResources.find((r) => r.id === resourceId)
    const customer = resource?.assignedCustomers.find((c) => c.id === customerId)

    if (!customer) return

    // Remove from resource
    setTargetResources((prev) =>
      prev.map((resource) => {
        if (resource.id === resourceId) {
          return {
            ...resource,
            assignedCustomers: resource.assignedCustomers.filter((c) => c.id !== customerId),
          }
        }
        return resource
      }),
    )

    // Add back to unassigned customers
    setCustomers((prev) => [...prev, customer])
  }

  const toggleDefaultEnrolled = (id: string) => {
    const toggleSelected = (customer: Customer) => customer.id === id ? { ...customer, defaultEnrolled: !customer.defaultEnrolled} : customer;
    setCustomers(customers.map(toggleSelected));
    setTargetResources(targetResources.map(targetResource => {
      return {
        ...targetResource,
        assignedCustomers: targetResource.assignedCustomers.map(toggleSelected),
      }
    }));
  }

  return (
    <div className="bg-blue-50">
      <h1 className="text-3xl font-bold text-foreground p-6">Funk, Stephen Opportunity</h1>
      <div className="ml-12 mb-4">
        <div className="flex items-center gap-6">
          <Label htmlFor="maxEnrollment">Max Enrollment Level</Label>
          <Input id="maxEnrollment" title="Max Enrollment" className="w-fit" value="Family" disabled></Input>
        </div>
        <div className="flex items-center gap-6">
          <Label htmlFor="defaultEnrollment">Default Enrollment Level</Label>
          <Input id="defaultEnrollment" className="w-fit" value="Employee/Child" disabled></Input>
        </div>
      </div>
      <div className="flex gap-6">
        {/* Target Resources Lane - Larger Left Side */}
        <div className="flex-2 bg-green-50 border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Target Resources</h2>
          <div >
            {targetResources.map((resource) => (
              <Card
                key={resource.id}
                className={`p-4 transition-all duration-200 gap-2 ${
                  dragOverResource === resource.id
                    ? "border-primary border-2 bg-accent/10"
                    : "border-border hover:border-accent"
                }`}
                onDragOver={(e) => handleDragOver(e, resource.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, resource.id)}
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-card-foreground mb-2">{resource.name}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                  {resource.costPerInterval 
                    ? <p className="text-sm text-muted-foreground">
                      <strong>Cost</strong>: {usd.format(resource.costPerInterval)}
                      × {resource.annualIntervals} paychecks per year is <strong>{usd.format(resource.costPerInterval * (resource.annualIntervals ?? 1))}</strong>
                    </p>
                    : ''
                  }
                  {resource.isGovtPlan ? <p className="text-sm text-muted-foreground"><strong>Non-Employer Plan</strong></p> : ""}
                </div>

                {/* Drop Zone */}
                <div
                  className={`min-h-16 border-2 border-dashed rounded-lg p-3 transition-all duration-200 ${
                    dragOverResource === resource.id ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                  }`}
                >
                  {resource.assignedCustomers.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Drop members here
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resource.assignedCustomers.map((customer) => (
                        <div id={customer.id}
                          key={customer.id}
                          draggable
                          onDragStart={() => handleDragStart(customer)}
                          onDragEnd={() => {
                            handleDragEnd()
                            handleRemoveCustomer(customer.id, resource.id)
                          }}
                        ><CustomerCard
                          customer={customer}
                          isDragged={draggedCustomer?.id === customer.id}
                          onToggle={() => toggleDefaultEnrolled(customer.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary">{resource.assignedCustomers.length} assigned</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Customers Lane - Smaller Right Side */}
        <div className="flex-1 bg-sidebar border border-sidebar-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-sidebar-foreground mb-6">Available Members</h2>
          <div className="space-y-3">
            {customers.map((customer) => (
              <div id={customer.id}
                key={customer.id}
                draggable
                onDragStart={() => handleDragStart(customer)}
                onDragEnd={handleDragEnd}
              >
                <CustomerCard
                  customer={customer}
                  isDragged={draggedCustomer?.id === customer.id}
                  onToggle={() => toggleDefaultEnrolled(customer.id)} 
                />
              </div>
            ))}

            {customers.length === 0 && (
              <div className="text-center text-muted-foreground py-8">All members have been assigned</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="p-6 flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-6 mt-6">Summary</h2>
          <p>Claim Impact: {
            usd.format(targetResources.filter(targetResources => targetResources.isAltResource).flatMap(targetResource => targetResource.assignedCustomers).reduce(
              (acc, customer) => acc + (customer.defaultEnrolled ? customer.claimImpact : 0), 
              0
            ))
          }</p>
          <p>Opt-out Credit: <em>[Some function of everything in the Financial Tools table]</em></p>
        </div>
        <div className="p-6 flex-2">
          <h2 className="text-xl font-semibold text-foreground mb-6">Financial Tools</h2>
          <div className="flex items-center gap-6 m-6">
            <Checkbox id="override" onClick={() => setOverride(!override)}></Checkbox>
            <Label htmlFor="override">Enable Override</Label>
          </div>
          <Card>
              <div className="flex items-center gap-6 ml-6">
                <Checkbox id="cost-based" value="cost-based"></Checkbox>
                <Label htmlFor="cost-based">Full Premium Reimbursement</Label>
                <Input className="w-fit" id="hsa-multi" type="number" disabled={!override} value={1407.12} />
              </div>
          </Card>
          <Card className="gap-0 pl-12">
            <Label>Flat Opt-out Credit</Label>
            <RadioGroup className="mt-4">
              <div className="flex items-center gap-6">
                <RadioGroupItem id="hsa-none" value="hsa-none"></RadioGroupItem>
                <Label className="font-normal" htmlFor="hsa-none">No Flat Opt-out</Label>
              </div>
              <div className="flex items-center gap-6">
                <RadioGroupItem value="hsa-1200"></RadioGroupItem>
                <Label className="font-normal" htmlFor="hsa-single">Single-member Flat</Label>
                <Input className="w-fit" id="hsa-single" type="number" disabled={!override} value={6000} />
              </div>
              <div className="flex items-center gap-6">
                <RadioGroupItem value="hsa-2400"></RadioGroupItem>
                <Label className="font-normal" htmlFor="hsa-multi">Multi-member Flat</Label>
                <Input className="w-fit" id="hsa-multi" type="number" disabled={!override} value={12000} />
              </div>
            </RadioGroup>
          </Card>
          <Card className="gap-0 pl-12">
            <Label>HSA Equivalency</Label>
            <RadioGroup className="mt-4">
              <div className="flex items-center gap-6">
                <RadioGroupItem id="hsa-none" value="hsa-none"></RadioGroupItem>
                <Label className="font-normal" htmlFor="hsa-none">No HSA</Label>
              </div>
              <div className="flex items-center gap-6">
                <RadioGroupItem value="hsa-1200"></RadioGroupItem>
                <Label className="font-normal" htmlFor="hsa-single">HSA (Single Member)</Label>
                <Input className="w-fit" id="hsa-single" type="number" disabled={!override} value={1200} />
              </div>
              <div className="flex items-center gap-6">
                <RadioGroupItem value="hsa-2400"></RadioGroupItem>
                <Label className="font-normal" htmlFor="hsa-multi">HSA (Multi Member)</Label>
                <Input className="w-fit" id="hsa-multi" type="number" disabled={!override} value={2400} />
              </div>
            </RadioGroup>
          </Card>
          <Card>
              <div className="flex items-center gap-6 ml-6">
                <Checkbox id="hra" value="hra"></Checkbox>
                <Label htmlFor="hra">HRA Enrollment</Label>
              </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
