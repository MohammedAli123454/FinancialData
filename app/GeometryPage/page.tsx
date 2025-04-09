'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Shapes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

type ShapeName = 'Circle' | 'Square' | 'Triangle' | 'Rectangle' | 'Octagon'

type Shape = {
  name: ShapeName
  component: React.ReactNode
  formula: string
  parameters: string[]
  explanation: React.ReactNode
  example: string
  color: string
  gradient: string
}

const ShapeVisual = ({ children, size = 48 }: { children: React.ReactNode; size?: number }) => (
  <div className={`relative w-${size} h-${size} mx-auto`}>
    {children}
  </div>
)

const Circle = () => (
  <ShapeVisual size={64}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="45" className="fill-blue-400" />
      <line x1="50" y1="50" x2="95" y2="50" stroke="red" strokeWidth="3" strokeDasharray="4" />
      <text x="72" y="45" fill="red" fontSize="14" fontWeight="bold">r</text>
    </svg>
  </ShapeVisual>
)

const Square = () => (
  <ShapeVisual size={64}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="10" y="10" width="80" height="80" className="fill-yellow-400" />
      <line x1="10" y1="95" x2="90" y2="95" stroke="red" strokeWidth="3" />
      <text x="40" y="90" fill="red" fontSize="14" fontWeight="bold">s</text>
    </svg>
  </ShapeVisual>
)

const Triangle = () => (
  <ShapeVisual size={64}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M50 10 L90 90 L10 90 Z" className="fill-green-400" />
      <line x1="10" y1="90" x2="90" y2="90" stroke="red" strokeWidth="3" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="red" strokeWidth="3" strokeDasharray="4" />
      <text x="35" y="85" fill="red" fontSize="14" fontWeight="bold">b</text>
      <text x="55" y="50" fill="red" fontSize="14" fontWeight="bold">h</text>
    </svg>
  </ShapeVisual>
)

const Rectangle = () => (
  <ShapeVisual size={64}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="15" y="30" width="70" height="40" className="fill-red-400" />
      <line x1="15" y1="75" x2="85" y2="75" stroke="red" strokeWidth="3" />
      <text x="40" y="70" fill="red" fontSize="14" fontWeight="bold">l</text>
      <line x1="85" y1="30" x2="85" y2="70" stroke="red" strokeWidth="3" strokeDasharray="4" />
      <text x="88" y="50" fill="red" fontSize="14" fontWeight="bold">w</text>
    </svg>
  </ShapeVisual>
)

const Octagon = () => (
  <ShapeVisual size={64}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M35 10 H65 L90 35 V65 L65 90 H35 L10 65 V35 Z" className="fill-purple-400" />
      <line x1="35" y1="50" x2="65" y2="50" stroke="red" strokeWidth="3" />
      <text x="45" y="45" fill="red" fontSize="14" fontWeight="bold">s</text>
    </svg>
  </ShapeVisual>
)

const shapes: Shape[] = [
  {
    name: 'Circle',
    component: <Circle />,
    formula: 'π × r²',
    parameters: ['radius'],
    explanation: (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg">
          <Shapes className="w-6 h-6" />
          <p>Radius (r) is the distance from center to edge!</p>
        </div>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 8 }}
          className="w-32 h-32 mx-auto"
        >
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="fill-blue-200" />
            <line x1="50" y1="50" x2="95" y2="50" stroke="red" strokeWidth="2" />
          </svg>
        </motion.div>
      </div>
    ),
    example: '3.14 × 5 × 5 = 78.5',
    color: 'text-blue-400',
    gradient: 'from-blue-100 to-blue-200'
  },
  {
    name: 'Square',
    component: <Square />,
    formula: 's × s',
    parameters: ['side'],
    explanation: (
      <div className="space-y-4">
        <p className="text-lg">Every side is equal! Just multiply side by itself.</p>
        <div className="relative h-40">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Here the square is displayed. If you want an animation that splits the square into two triangles,
                you can replace the SVG below with a similar approach to the triangle splitting animation. */}
            <svg viewBox="0 0 100 100" className="w-32 h-32">
              <rect x="10" y="10" width="80" height="80" className="fill-yellow-300" />
              <line x1="10" y1="95" x2="90" y2="95" stroke="red" strokeWidth="2" />
            </svg>
          </motion.div>
        </div>
      </div>
    ),
    example: '5 × 5 = 25',
    color: 'text-yellow-400',
    gradient: 'from-yellow-100 to-yellow-200'
  },
  {
    name: 'Triangle',
    component: <Triangle />,
    formula: '½ × b × h',
    parameters: ['base', 'height'],
    explanation: (
      <div className="space-y-4">
        <p className="text-lg">Two triangles can form a rectangle! Watch them gently slide apart.</p>
        <div className="relative h-40 flex items-center justify-center">
          <motion.svg
            initial={{ x: 0 }}
            animate={{ x: -20 }}
            transition={{ duration: 3, yoyo: Infinity }}
            viewBox="0 0 100 100"
            className="w-1/2"
          >
            <path d="M10 10 L90 90 L10 90 Z" className="fill-green-300" />
          </motion.svg>
          <motion.svg
            initial={{ x: 0 }}
            animate={{ x: 20 }}
            transition={{ duration: 3, yoyo: Infinity }}
            viewBox="0 0 100 100"
            className="w-1/2"
          >
            <path d="M90 10 L90 90 L10 10 Z" className="fill-green-300" />
          </motion.svg>
        </div>
      </div>
    ),
    example: '½ × 8 × 8 = 32',
    color: 'text-green-400',
    gradient: 'from-green-100 to-green-200'
  },
  {
    name: 'Rectangle',
    component: <Rectangle />,
    formula: 'l × w',
    parameters: ['length', 'width'],
    explanation: (
      <div className="space-y-4">
        <p className="text-lg">Multiply length and width like counting chocolate pieces!</p>
        <div className="relative h-40">
          <motion.div
            animate={{ x: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg viewBox="0 0 100 100" className="w-32 h-32">
              <rect x="15" y="30" width="70" height="40" className="fill-red-300" />
              <line x1="15" y1="75" x2="85" y2="75" stroke="red" strokeWidth="2" />
            </svg>
          </motion.div>
        </div>
      </div>
    ),
    example: '7 × 4 = 28',
    color: 'text-red-400',
    gradient: 'from-red-100 to-red-200'
  },
  {
    name: 'Octagon',
    component: <Octagon />,
    formula: '2 × (1 + √2) × s²',
    parameters: ['side'],
    explanation: (
      <div className="space-y-4">
        <p className="text-lg">Special formula for eight equal sides!</p>
        <div className="relative h-40">
          <motion.div
            animate={{ rotate: [0, 45, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg viewBox="0 0 100 100" className="w-32 h-32">
              <path d="M35 10 H65 L90 35 V65 L65 90 H35 L10 65 V35 Z" className="fill-purple-300" />
              <line x1="35" y1="50" x2="65" y2="50" stroke="red" strokeWidth="2" />
            </svg>
          </motion.div>
        </div>
      </div>
    ),
    example: '2 × (1 + 1.414) × 5² ≈ 120.7',
    color: 'text-purple-400',
    gradient: 'from-purple-100 to-purple-200'
  }
]

export default function GeometryPage() {
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null)
  const { register, handleSubmit, reset, watch } = useForm()
  const [result, setResult] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const watchedValues = watch() // capture current form values

  const calculateArea = (data: any) => {
    if (!selectedShape) return

    const calculations = {
      Circle: Math.PI * data.radius ** 2,
      Square: data.side ** 2,
      Triangle: 0.5 * data.base * data.height,
      Rectangle: data.length * data.width,
      Octagon: 2 * (1 + Math.sqrt(2)) * data.side ** 2,
    }

    setResult(calculations[selectedShape.name])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🧮 Shape Explorer
          </h1>
          <p className="text-lg text-gray-600">Discover the magic of geometry!</p>
        </header>

        <Carousel className="w-full mb-8">
          <CarouselContent>
            {shapes.map((shape) => (
              <CarouselItem key={shape.name} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-2 cursor-pointer"
                  onClick={() => {
                    setSelectedShape(shape)
                    reset()
                    setResult(null)
                  }}
                >
                  <Card className={`bg-gradient-to-br ${shape.gradient} border-0 shadow-md`}>
                    <CardContent className="p-4 flex aspect-square items-center justify-center">
                      {shape.component}
                    </CardContent>
                  </Card>
                  <p className="text-center mt-2 font-medium text-gray-700">{shape.name}</p>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {selectedShape && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-800">
                  {selectedShape.name} Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(calculateArea)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedShape.parameters.map((param) => (
                      <div key={param} className="space-y-2">
                        <Label className="text-lg text-gray-700">
                          {param.charAt(0).toUpperCase() + param.slice(1)}
                        </Label>
                        <Input
                          {...register(param, { required: true, min: 0 })}
                          type="number"
                          className="h-12 text-lg border-2 border-gray-200 rounded-xl"
                          placeholder="Enter value"
                        />
                      </div>
                    ))}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
                  >
                    Calculate Area
                  </Button>
                </form>

                {result !== null && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="mt-6 p-4 bg-white rounded-lg shadow-sm"
                  >
                    <div className="text-center space-y-3">
                      <p className="text-2xl font-bold text-blue-600">
                        Area: {result.toFixed(2)}
                      </p>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="gap-2 rounded-xl">
                            <span>🧐 How's this calculated?</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl text-gray-800">
                              {selectedShape.name} Formula
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Let's break it down!
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {selectedShape.explanation}
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="font-mono text-lg text-purple-600">
                                Example: {selectedShape.example}
                              </p>
                              <p className="mt-2 text-gray-600">
                                Entered Values: {JSON.stringify(watchedValues)}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
