/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './luasrc/view/**/*.htm',
        './htdocs/luci-static/orion/resources/js/**/*.js',
        './src/**/*.js',
        './demo/**/*.html'
    ],
    safelist: [
        'sm:flex-row',
        'sm:space-y-0',
        'sm:block',
        'sm:flex-col',
        'md:flex-row',
        'lg:flex-row',
        'animation-delay-300',
        'animation-delay-500',
        'blur-3xl',
        'glass-ultra',
        'alert-error',
        'text-shadow',
        'bg-primary-400/5',
        'bg-primary-500/10',
        'bg-primary-500/20',
        'bg-primary-600/10',
        'border-primary-500/30',
        'border-t-primary-400',
        'border-t-primary-500',
        'shadow-hero-lg',
        'shadow-hero-xl',
        'hover:shadow-hero-xl',
        'active:shadow-hero',
        'focus:ring-primary-500/20',
        'group-hover:border-primary-400/50',
        'hover:-translate-y-1',
        '-translate-x-1/2',
        '-translate-y-1/2',
        'active:translate-y-0',
        'focus:border-primary-500',
        'focus:outline-none',
        'focus:ring-2',
        'group',
        'hover:bg-danger-500/10',
        'hover:bg-white/10',
        'hover:bg-white/20',
        'hover:opacity-100',
        'hover:scale-105',
        'hover:text-danger-300',
        'hover:text-primary-400',
        'hover:text-white',
        'placeholder-neutral-400',
        'warning',
        'bg-primary/20',
        'backdrop-blur-xl',
        'bg-dark-light/90',
        'border-0',
        'custom-scrollbar',
        'focus:ring-primary-500',
        'hover:-translate-y-0.5',
        'hover:shadow-xl',
        'pt-2',
        'space-y-5',
        'w-56',
        'glass-panel',
        'glass-heavy',
        'rounded-xl',
        'transition-all',
        'duration-300',
        'ease-in-out',
        'transform',
        'translate-x-0',
        'lg:translate-x-0',
        'fixed',
        'left-0',
        'top-16',
        'bottom-0',
        'w-64',
        'z-30',
        'sidebar-orion',
        'h-full',
        'overflow-y-auto',
        'p-4',
        'space-y-2',
        'animate-fade-in',
        'max-w-full',
        'h-16',
        'px-6',
        'lg:px-8',
        'space-x-4',
        'space-x-3',
        'relative',
        'h-8',
        'w-auto',
        'group-hover:brightness-110',
        'absolute',
        'inset-0',
        'rounded-full',
        'blur-xl',
        'opacity-0',
        'group-hover:opacity-100',
        'hidden',
        'text-xl',
        'font-bold',
        'text-white',
        'group-hover:text-primary-400',
        'transition-colors',
        'text-xs',
        'text-neutral-400',
        'lg:flex',
        'items-center',
        'space-x-2',
        'flex',
        'justify-center',
        'w-10',
        'h-10',
        'hover:bg-white/10',
        'w-5',
        'h-5',
        'text-neutral-300',
        'group-hover:text-white',
        'fill-none',
        'stroke-currentColor',
        'viewBox-0-0-24-24',
        '-top-1',
        '-right-1',
        'w-3',
        'h-3',
        'bg-danger-500',
        'bg-warning-500',
        'bg-success-500',
        'animate-pulse',
        'px-3',
        'py-2',
        'space-x-2',
        'bg-gradient-to-r',
        'from-primary-500',
        'to-primary-600',
        'rounded-lg',
        'w-4',
        'h-4',
        'text-sm',
        'font-medium',
        'transition-transform',
        'group-hover:rotate-180',
        'right-0',
        'top-full',
        'mt-2',
        'border',
        'border-white/10',
        'invisible',
        'scale-95',
        'origin-top-right',
        'z-50',
        'py-2',
        'py-3',
        'border-b',
        'py-1',
        'px-4',
        'mr-3',
        'my-1',
        'w-full',
        'lg:hidden',
        'min-h-screen',
        'pt-16',
        'z-40',
        'mb-4',
        'w-12',
        'h-12',
        'border-4',
        'animate-spin',
        'mx-auto',
        'bg-dark-light/50',
        'nav',
        'space-x-1',
        'bg-dark-light/30',
        'flex-wrap',
        'gap-2',
        'flex-1',
        'p-6',
        'max-w-7xl',
        'space-y-6',
        'alert-message'
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#09c',
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#09c',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554'
                },

                // 深色主题升级
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    DEFAULT: '#0a0a0a',
                    light: '#222235',
                    glass: 'rgba(34, 35, 53, 0.6)',
                    'glass-heavy': 'rgba(34, 35, 53, 0.8)'
                },

                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d'
                },

                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f'
                },

                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d'
                },

                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a'
                }
            },

            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                inter: ['Inter-Regular', 'Inter-Medium', 'Inter-Bold', 'sans-serif'],
                quicksand: ['Quicksand-Regular', 'Quicksand-Bold', 'sans-serif'],
                display: ['Inter-Black', 'Inter-Bold', 'sans-serif']
            },

            // 现代化字体大小
            fontSize: {
                'xs': ['0.75rem', {lineHeight: '1rem'}],
                'sm': ['0.875rem', {lineHeight: '1.25rem'}],
                'base': ['1rem', {lineHeight: '1.5rem'}],
                'lg': ['1.125rem', {lineHeight: '1.75rem'}],
                'xl': ['1.25rem', {lineHeight: '1.75rem'}],
                '2xl': ['1.5rem', {lineHeight: '2rem'}],
                '3xl': ['1.875rem', {lineHeight: '2.25rem'}],
                '4xl': ['2.25rem', {lineHeight: '2.5rem'}],
                '5xl': ['3rem', {lineHeight: '1'}],
                '6xl': ['3.75rem', {lineHeight: '1'}]
            },

            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem'
            },

            // 现代化阴影系统
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                'hero-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
                'hero': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'hero-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'hero-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'hero-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                'glow': '0 0 20px rgba(9, 12, 196, 0.3)'
            },

            // 毛玻璃效果
            backdropBlur: {
                'xs': '2px',
                'glass': '10px',
                'glass-heavy': '20px',
                'glass-ultra': '40px'
            },

            // HeroUI风格圆角
            borderRadius: {
                'none': '0',
                'sm': '0.125rem',
                'DEFAULT': '0.25rem',
                'md': '0.375rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                'glass': '1.25rem', // 20px
                'hero': '0.75rem',   // 12px
                'full': '9999px'
            },

            // 动画和过渡
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'fade-out': 'fadeOut 0.5s ease-in-out',
                'slide-in-left': 'slideInLeft 0.3s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'bounce-gentle': 'bounceGentle 0.6s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'glass-appear': 'glassAppear 0.4s ease-out'
            },

            // 渐变背景
            backgroundImage: {
                'hero-gradient': 'linear-gradient(135deg, rgba(9, 12, 196, 0.1) 0%, rgba(34, 35, 53, 0.8) 100%)',
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                'primary-gradient': 'linear-gradient(135deg, #09c 0%, #2563eb 100%)',
                'dark-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #222235 100%)'
            }
        }
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class'
        }),
        require('@tailwindcss/typography'),

        function ({addComponents, addUtilities, theme}) {
            addComponents({
                '.glass-panel': {
                    backgroundColor: theme('colors.dark.glass'),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: theme('boxShadow.glass')
                },

                '.glass-heavy': {
                    backgroundColor: theme('colors.dark.glass-heavy'),
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: theme('boxShadow.glass')
                },

                '.glass-ultra': {
                    backgroundColor: 'rgba(34, 35, 53, 0.9)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: theme('boxShadow.glass')
                },

                '.btn-hero': {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: theme('borderRadius.hero'),
                    fontWeight: theme('fontWeight.medium'),
                    fontSize: theme('fontSize.sm'),
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    userSelect: 'none',
                    position: 'relative',
                    overflow: 'hidden'
                },

                '.btn-primary': {
                    background: theme('backgroundImage.primary-gradient'),
                    color: theme('colors.white'),
                    padding: '0.75rem 1.5rem',
                    boxShadow: theme('boxShadow.hero'),
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme('boxShadow.hero-lg')
                    },
                    '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow: theme('boxShadow.hero')
                    }
                },

                '.btn-glass': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    color: theme('colors.white'),
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.75rem 1.5rem',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-1px)'
                    }
                },

                '.card-hero': {
                    backgroundColor: theme('colors.dark.glass'),
                    backdropFilter: 'blur(20px)',
                    borderRadius: theme('borderRadius.glass'),
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1.5rem',
                    boxShadow: theme('boxShadow.glass'),
                    transition: 'all 0.3s ease'
                },

                '.card-hero:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme('boxShadow.hero-xl'),
                    borderColor: 'rgba(9, 12, 196, 0.3)'
                },

                '.alert-error': {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    borderRadius: theme('borderRadius.lg'),
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: theme('colors.danger.400'),
                    gap: '0.75rem'
                },

                '.alert-warning': {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    borderRadius: theme('borderRadius.lg'),
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: theme('colors.warning.400'),
                    gap: '0.75rem'
                },

                // 成功提示组件
                '.alert-success': {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    borderRadius: theme('borderRadius.lg'),
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: theme('colors.success.400'),
                    gap: '0.75rem'
                },

                // 信息提示组件
                '.alert-info': {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    borderRadius: theme('borderRadius.lg'),
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    color: theme('colors.primary.400'),
                    gap: '0.75rem'
                }
            });

            // 自定义动画关键帧
            addUtilities({
                // 文字阴影工具类
                '.text-shadow': {
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                },
                '.text-shadow-sm': {
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                },
                '.text-shadow-lg': {
                    textShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
                },
                '.text-shadow-none': {
                    textShadow: 'none'
                },

                // 动画延迟工具类
                '.animation-delay-300': {
                    animationDelay: '300ms'
                },
                '.animation-delay-500': {
                    animationDelay: '500ms'
                },
                '.animation-delay-700': {
                    animationDelay: '700ms'
                },
                '.animation-delay-1000': {
                    animationDelay: '1000ms'
                },

                // 模糊效果
                '.blur-3xl': {
                    filter: 'blur(64px)'
                },

                // 自定义滚动条样式
                '.custom-scrollbar': {
                    '&::-webkit-scrollbar': {
                        width: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'rgba(34, 35, 53, 0.3)',
                        borderRadius: '3px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0, 153, 204, 0.5)',
                        borderRadius: '3px'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(0, 153, 204, 0.7)'
                    }
                },
                '@keyframes fadeIn': {
                    '0%': {opacity: '0'},
                    '100%': {opacity: '1'}
                },
                '@keyframes fadeOut': {
                    '0%': {opacity: '1'},
                    '100%': {opacity: '0'}
                },
                '@keyframes slideInLeft': {
                    '0%': {transform: 'translateX(-100%)', opacity: '0'},
                    '100%': {transform: 'translateX(0)', opacity: '1'}
                },
                '@keyframes slideInRight': {
                    '0%': {transform: 'translateX(100%)', opacity: '0'},
                    '100%': {transform: 'translateX(0)', opacity: '1'}
                },
                '@keyframes slideUp': {
                    '0%': {transform: 'translateY(100%)', opacity: '0'},
                    '100%': {transform: 'translateY(0)', opacity: '1'}
                },
                '@keyframes bounceGentle': {
                    '0%, 20%, 53%, 80%, 100%': {transform: 'translate3d(0,0,0)'},
                    '40%, 43%': {transform: 'translate3d(0, -5px, 0)'},
                    '70%': {transform: 'translate3d(0, -3px, 0)'},
                    '90%': {transform: 'translate3d(0, -1px, 0)'}
                },
                '@keyframes pulseGlow': {
                    '0%, 100%': {boxShadow: '0 0 20px rgba(9, 12, 196, 0.3)'},
                    '50%': {boxShadow: '0 0 30px rgba(9, 12, 196, 0.6)'}
                },
                '@keyframes glassAppear': {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.95)',
                        backdropFilter: 'blur(0px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)',
                        backdropFilter: 'blur(20px)'
                    }
                }
            });
        }
    ]
};