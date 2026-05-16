'use client'

import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'

const DecoLogo = () => (
  <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="6" fill="#0A0800"/>
    <polygon points="50,8 88,32 88,35 50,14 12,35 12,32" fill="#D6B25E"/>
    <polygon points="50,18 80,36 80,39 50,24 20,39 20,36" fill="#A67C2D"/>
    <polygon points="50,28 72,40 72,43 50,34 28,43 28,40" fill="#D6B25E"/>
    <polygon points="50,36 66,44 66,47 50,41 34,47 34,44" fill="#8B6010"/>
    <rect x="38" y="44" width="8"  height="32" fill="#D6B25E"/>
    <rect x="54" y="44" width="8"  height="32" fill="#D6B25E"/>
    <rect x="38" y="44" width="24" height="7"  fill="#A67C2D"/>
    <rect x="40" y="56" width="4" height="5" fill="#0A0800" opacity="0.8"/>
    <rect x="56" y="56" width="4" height="5" fill="#0A0800" opacity="0.8"/>
    <rect x="28" y="76" width="44" height="4" fill="#A67C2D"/>
    <path d="M50 4 L52 9 L57 9 L53 12 L55 17 L50 14 L45 17 L47 12 L43 9 L48 9Z" fill="#F2D27A" opacity="0.9"/>
    <rect width="100" height="100" rx="6" fill="none" stroke="rgba(214,178,94,0.45)" strokeWidth="2"/>
  </svg>
)

const StandardLogo = ({ theme }: { theme: { colors: { border: string; card: string } } }) => (
  <div style={{
    width: 40, height: 40, borderRadius: 8, ove
