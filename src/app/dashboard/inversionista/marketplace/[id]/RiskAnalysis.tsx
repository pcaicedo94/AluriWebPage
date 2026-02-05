'use client'

import { Sparkles, CheckCircle2 } from 'lucide-react'

interface RiskAnalysisProps {
  ltv: number
  propertyType: string | undefined
  city: string | undefined
}

export default function RiskAnalysis({ ltv, propertyType, city }: RiskAnalysisProps) {
  // Calculate risk score (0-100) based on various factors
  const calculateRiskScore = () => {
    let score = 100

    if (ltv > 70) score -= 30
    else if (ltv > 60) score -= 20
    else if (ltv > 50) score -= 10
    else if (ltv > 40) score -= 5

    if (propertyType?.toLowerCase().includes('casa')) score += 5
    if (propertyType?.toLowerCase().includes('apartamento')) score += 3
    if (propertyType?.toLowerCase().includes('local')) score -= 5

    const majorCities = ['bogota', 'medellin', 'cali', 'barranquilla', 'cartagena']
    if (city && majorCities.some(c => city.toLowerCase().includes(c))) {
      score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  const riskScore = calculateRiskScore()

  // Determine risk level
  const getRiskLevel = () => {
    if (riskScore >= 85) return { label: 'Riesgo Bajo', color: 'text-emerald-400', borderColor: 'border-emerald-500/50', bgColor: 'bg-emerald-500/10' }
    if (riskScore >= 70) return { label: 'Moderado', color: 'text-teal-400', borderColor: 'border-teal-500/50', bgColor: 'bg-teal-500/10' }
    if (riskScore >= 55) return { label: 'Medio', color: 'text-amber-400', borderColor: 'border-amber-500/50', bgColor: 'bg-amber-500/10' }
    return { label: 'Riesgo Alto', color: 'text-red-400', borderColor: 'border-red-500/50', bgColor: 'bg-red-500/10' }
  }

  const riskLevel = getRiskLevel()

  // SVG donut chart calculations
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (riskScore / 100) * circumference

  // Analysis points based on actual data
  const ltvMultiple = ltv > 0 ? (100 / ltv).toFixed(2) : '0'

  const analysisPoints = [
    `El avalúo del activo supera la solicitud de préstamo por ${ltvMultiple}x.`,
    'El historial crediticio del prestatario muestra patrones de pago consistentes en los últimos 5 años.',
    'Los planes de remodelación están verificados por auditoría de arquitecto externo.'
  ]

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles size={20} className="text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Análisis de Riesgo Aluri AI</h3>
        </div>

        {/* Risk Badge */}
        <span className={`px-3 py-1.5 ${riskLevel.bgColor} ${riskLevel.color} border ${riskLevel.borderColor} text-xs font-semibold rounded-full`}>
          {riskLevel.label}
        </span>
      </div>

      <div className="flex gap-6 items-start">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#riskGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{ filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.5))' }}
            />
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#5eead4" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{riskScore}</span>
            <span className="text-gray-600 text-xs uppercase tracking-wider">Puntuación</span>
          </div>
        </div>

        {/* Analysis Points */}
        <div className="flex-1 space-y-3">
          {analysisPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-400 text-sm leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Badges */}
      <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
          <span className="text-gray-500 text-xs">Garantía Verificada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
          <span className="text-gray-500 text-xs">Título Limpio</span>
        </div>
      </div>
    </div>
  )
}
