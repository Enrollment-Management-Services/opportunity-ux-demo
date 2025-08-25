import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { usd } from "./lib/utils"

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
    name: "Employee",
    description: "",
    assignedCustomers: [],
  },
  {
    id: "resource-2",
    name: "Employee/Spouse",
    description: "",
    assignedCustomers: [],
  },
  {
    id: "resource-3",
    name: "Employee/Child",
    description: "",
    assignedCustomers: [],
  },
  {
    id: "resource-4",
    name: "Family",
    description: "Comprehensive training programs",
    assignedCustomers: [],
  },
]

export default function DragDropApp() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [targetResources, setTargetResources] = useState<TargetResource[]>(initialTargetResources)
  const [draggedCustomer, setDraggedCustomer] = useState<Customer | null>(null)
  const [dragOverResource, setDragOverResource] = useState<string | null>(null)

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

  function CustomerCard({customer}: {customer: Customer}) {
    const [defaultEnrolled, setDefaultEnrolled] = useState(customer.defaultEnrolled);
    const toggleDefaultEnrolled = () => setDefaultEnrolled(!defaultEnrolled);
    return <Card               
      className={`p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
      draggedCustomer?.id === customer.id ? "opacity-50 scale-95" : ""
    }`}>
      <div className="font-medium text-card-foreground">{customer.name}</div>
      <div className="flex items-center gap-6">
        <Label htmlFor={customer.id + '-defenr'}>Default Enrolled</Label>
        <Checkbox id={customer.id + '-defenr'} defaultChecked={customer.defaultEnrolled} onClick={toggleDefaultEnrolled} />
      </div>
      {defaultEnrolled ?
        <div className="flex items-center gap-6">
          <p className="text-sm text-muted-foreground">Claim Impact: </p>
          <div className="text-sm text-muted-foreground">{usd.format(customer.claimImpact).slice(0,-3)}</div>
        </div>
        : ''
      }

    </Card>
  }

  return (
    <div className="flex gap-6">
      {/* Target Resources Lane - Larger Left Side */}
      <div className="flex-2 bg-background border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Target Resources</h2>
        <div >
          {targetResources.map((resource) => (
            <Card
              key={resource.id}
              className={`p-4 transition-all duration-200 ${
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
                      ><CustomerCard customer={customer} />
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
            ><CustomerCard customer={customer} />
            </div>
          ))}

          {customers.length === 0 && (
            <div className="text-center text-muted-foreground py-8">All members have been assigned</div>
          )}
        </div>
      </div>
    </div>
  )
}
