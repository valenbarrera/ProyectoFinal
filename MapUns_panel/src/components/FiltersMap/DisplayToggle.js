import React from 'react';
import { ButtonGroup, Button, Label } from 'reactstrap';

const DisplayToggle = ({ value = 'procedencia', onChange, disableEstudio = true }) => {
  const setValue = (v) => {
    if (onChange) onChange(v);
  };

  return (
    <div className="d-flex align-items-center">
      <Label className="mb-0 mr-2" style={{ color: 'white' }}>Visualización</Label>
      <ButtonGroup>
        <Button
          color={value === 'procedencia' ? 'primary' : 'light'}
          onClick={() => setValue('procedencia')}
          active={value === 'procedencia'}
        >
          Procedencia
        </Button>
        <Button
          color={value === 'estudio' ? 'primary' : 'light'}
          onClick={() => setValue('estudio')}
          active={value === 'estudio'}
          disabled={disableEstudio}
        >
          Estudio
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default DisplayToggle;

