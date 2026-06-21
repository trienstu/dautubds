import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export const AlignLeftIcon = () => <AlignLeft size={16} />;
export const AlignCenterIcon = () => <AlignCenter size={16} />;
export const AlignRightIcon = () => <AlignRight size={16} />;
export const AlignJustifyIcon = () => <AlignJustify size={16} />;

export const AlignLeftRender = (props: any) => (
  <span style={{ display: 'inline-block', textAlign: 'left', width: '100%' }}>
    {props.renderDefault(props)}
  </span>
);

export const AlignCenterRender = (props: any) => (
  <span style={{ display: 'inline-block', textAlign: 'center', width: '100%' }}>
    {props.renderDefault(props)}
  </span>
);

export const AlignRightRender = (props: any) => (
  <span style={{ display: 'inline-block', textAlign: 'right', width: '100%' }}>
    {props.renderDefault(props)}
  </span>
);

export const AlignJustifyRender = (props: any) => (
  <span style={{ display: 'inline-block', textAlign: 'justify', width: '100%' }}>
    {props.renderDefault(props)}
  </span>
);
