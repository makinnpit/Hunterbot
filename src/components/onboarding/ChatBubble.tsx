import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import OnboardingAvatar from './OnboardingAvatar';

interface ChatBubbleProps {
  message: {
    sender: 'HunterAI' | 'User';
    text: string;
    options?: string[];
    isTyping?: boolean;
    avatar?: string;
  };
  onOptionClick?: (option: string) => void;
}

// Styled components
const BubbleContainer = styled(motion.div)<{ isbot: boolean }>(({ isbot }) => ({
  display: 'flex',
  justifyContent: isbot ? 'flex-start' : 'flex-end',
  width: '100%',
  marginBottom: '16px',
}));

const ContentWrapper = styled(Box)<{ isbot: boolean }>(({ theme, isbot }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
  maxWidth: '85%',
}));

const BubbleContent = styled(Box)<{ isbot: boolean }>(({ theme, isbot }) => ({
  padding: '12px 16px',
  borderRadius: isbot ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
  background: isbot 
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.12) 100%)'
    : 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(236, 72, 153, 0.12) 100%)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${isbot ? 'rgba(99, 102, 241, 0.2)' : 'rgba(236, 72, 153, 0.2)'}`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: '2px',
    background: isbot 
      ? 'linear-gradient(90deg, #6366F1, transparent)' 
      : 'linear-gradient(90deg, transparent, #EC4899)',
    left: isbot ? 0 : 'auto',
    right: isbot ? 'auto' : 0,
  },
}));

const OptionButton = styled(Button)<{ isbot: boolean }>(({ theme, isbot }) => ({
  borderRadius: '20px',
  padding: '6px 16px',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  borderColor: isbot ? 'rgba(99, 102, 241, 0.3)' : 'rgba(236, 72, 153, 0.3)',
  color: isbot ? '#6366F1' : '#EC4899',
  '&:hover': {
    borderColor: isbot ? '#6366F1' : '#EC4899',
    background: isbot ? 'rgba(99, 102, 241, 0.08)' : 'rgba(236, 72, 153, 0.08)',
    transform: 'translateY(-2px)',
  },
}));

// Typing animation dot
const TypingDot = styled(motion.div)(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#6366F1',
  margin: '0 2px',
}));

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onOptionClick }) => {
  const theme = useTheme();
  const isBot = message.sender === 'HunterAI';
  
  // Animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      x: isBot ? -20 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 500,
        damping: 40,
        mass: 1
      }
    }
  };
  
  const optionsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.3 
      }
    }
  };
  
  const optionVariants = {
    hidden: { opacity: 0, x: isBot ? -10 : 10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };
  
  return (
    <BubbleContainer
      isbot={isBot}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ContentWrapper isbot={isBot}>
        {isBot && (
          <Box sx={{ mt: 0.5 }}>
            <OnboardingAvatar type="bot" letter={message.avatar} size="small" />
          </Box>
        )}
        
        <BubbleContent isbot={isBot}>
          {message.isTyping ? (
            <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, px: 1, height: 32 }}>
              <TypingDot animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, type: 'tween' }} />
              <TypingDot animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15, type: 'tween' }} />
              <TypingDot animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3, type: 'tween' }} />
            </Box>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: message.options?.length ? 1.5 : 0 }}>
                {message.text}
              </Typography>
              
              {message.options && message.options.length > 0 && (
                <motion.div 
                  variants={optionsVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ marginTop: '12px' }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {message.options.map((option, idx) => (
                      <motion.div key={idx} variants={optionVariants}>
                        <OptionButton
                          isbot={isBot}
                          variant="outlined"
                          size="small"
                          onClick={() => onOptionClick && onOptionClick(option)}
                        >
                          {option}
                        </OptionButton>
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>
              )}
            </>
          )}
        </BubbleContent>
        
        {!isBot && (
          <Box sx={{ mt: 0.5 }}>
            <OnboardingAvatar type="user" letter={message.avatar} size="small" />
          </Box>
        )}
      </ContentWrapper>
    </BubbleContainer>
  );
};

export default ChatBubble; 