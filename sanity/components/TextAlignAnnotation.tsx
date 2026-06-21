import React from 'react';
import { AlignCenter } from 'lucide-react';

export const TextAlignIcon = () => <AlignCenter size={16} />;

export const TextAlignRender = (props: any) => {
  const align = props.value?.align || 'left';
  return (
    <span style={{ display: 'inline-block', width: '100%', textAlign: align }}>
      {props.renderDefault(props)}
    </span>
  );
};
