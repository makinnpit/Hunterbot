import React from 'react';
import { Avatar, Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';

// Define avatar types
export type AvatarType = 'bot' | 'user';

// Props interface
interface OnboardingAvatarProps {
  type: AvatarType;
  size?: 'small' | 'medium' | 'large';
  letter?: string;
  pulseEffect?: boolean;
  onClick?: () => void;
}

// Styled components
const AnimatedAvatar = styled(motion.div)`
  position: relative;
  cursor: pointer;
  user-select: none;
`;

const AvatarBadge = styled(Box)<{ type: string }>(({ theme, type }) => ({
  position: 'absolute',
  bottom: -2,
  right: -2,
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: type === 'bot' ? '#10B981' : '#6366F1',
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.05)',
}));

const OnboardingAvatar: React.FC<OnboardingAvatarProps> = ({
  type,
  size = 'medium',
  letter,
  pulseEffect = false,
  onClick,
}) => {
  const theme = useTheme();
  
  // Avatar sizes
  const sizes = {
    small: { width: 32, height: 32, fontSize: '0.8rem' },
    medium: { width: 44, height: 44, fontSize: '1rem' },
    large: { width: 88, height: 88, fontSize: '2rem' },
  };
  
  // Avatar styles based on type
  const getAvatarStyles = () => {
    if (type === 'bot') {
      return {
        background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
        color: '#FFFFFF',
        fontWeight: 700,
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
        ...sizes[size],
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
        color: '#FFFFFF',
        fontWeight: 700,
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
        ...sizes[size],
      };
    }
  };
  
  // Get default letter
  const getDefaultLetter = () => {
    return type === 'bot' ? 'H' : 'U';
  };
  
  // Animation variants
  const pulseAnimation = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 4px 12px rgba(99, 102, 241, 0.3)',
        '0 0 20px rgba(99, 102, 241, 0.6)',
        '0 4px 12px rgba(99, 102, 241, 0.3)',
      ],
    },
  };
  
  return (
    <AnimatedAvatar
      initial="rest"
      whileHover="hover"
      animate={pulseEffect ? 'pulse' : 'rest'}
      variants={pulseAnimation}
      transition={{
        type: pulseEffect ? 'tween' : 'spring',
        stiffness: 300,
        damping: 15,
        duration: pulseEffect ? 2 : undefined,
        repeat: pulseEffect ? Infinity : 0,
        repeatType: 'loop',
      }}
      onClick={onClick}
    >
      <Avatar sx={getAvatarStyles()}>
        <Typography
          sx={{
            fontWeight: 700,
            color: '#FFFFFF',
            fontSize: sizes[size].fontSize,
          }}
        >
          {letter || getDefaultLetter()}
        </Typography>
      </Avatar>
      <AvatarBadge type={type} />
    </AnimatedAvatar>
  );
};

export default OnboardingAvatar; 