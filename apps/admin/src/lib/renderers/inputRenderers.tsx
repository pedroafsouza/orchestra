import type { ComponentRenderer } from './types';

const renderInput: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <input
      type={props.type || 'text'}
      placeholder={props.placeholder || 'Input...'}
      value={ctx.interactive ? (ctx.formValues[component.id] ?? '') : undefined}
      onChange={ctx.interactive ? (e) => ctx.onFormChange(component.id, e.target.value) : undefined}
      readOnly={!ctx.interactive}
      disabled={!ctx.interactive}
      style={{
        width: '100%',
        padding: '10px 12px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 8,
        color: '#f8fafc',
        fontSize: 14,
        boxSizing: 'border-box' as const,
        ...(ctx.interactive ? { outline: 'none' } : {}),
        ...ctx.resolvedStyle,
      }}
    />
  );
};

const renderCombobox: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <select
      value={ctx.interactive ? (ctx.formValues[component.id] ?? '') : undefined}
      onChange={ctx.interactive ? (e) => ctx.onFormChange(component.id, e.target.value) : undefined}
      disabled={!ctx.interactive}
      style={{
        width: '100%',
        padding: '10px 12px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 8,
        color: '#94a3b8',
        fontSize: 14,
        ...ctx.resolvedStyle,
      }}
    >
      <option value="">{props.placeholder || 'Choose...'}</option>
      {ctx.interactive &&
        (props.options as string[] | undefined)?.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
    </select>
  );
};

const renderCheckbox: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const isChecked = ctx.interactive
    ? (ctx.checkedValues[component.id] ?? props.checked ?? false)
    : (props.checked || false);
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        color: '#f8fafc',
        fontSize: 14,
        ...(ctx.interactive ? { userSelect: 'none' as const } : {}),
        ...ctx.resolvedStyle,
      }}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={
          ctx.interactive
            ? (e) => {
                ctx.onCheckedChange(component.id, e.target.checked);
                if (component.actions) {
                  for (const action of component.actions) {
                    ctx.onAction({
                      type: action.type,
                      payload: {
                        ...action,
                        checked: e.target.checked,
                        entry: ctx.entry,
                      },
                      formValues: ctx.formValues,
                    });
                  }
                }
              }
            : undefined
        }
        disabled={!ctx.interactive}
        style={{
          width: 18,
          height: 18,
          accentColor: '#6366f1',
          ...(ctx.interactive ? { cursor: 'pointer' } : {}),
        }}
      />
      {props.label || 'Checkbox'}
    </label>
  );
};

const renderSwitch: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const isOn = ctx.interactive
    ? (ctx.checkedValues[component.id] ?? props.checked ?? false)
    : (props.checked ?? false);
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: ctx.interactive ? 'pointer' : 'default',
        color: '#f8fafc',
        fontSize: 14,
        userSelect: 'none',
        ...ctx.resolvedStyle,
      }}
    >
      <div
        role="switch"
        aria-checked={isOn}
        onClick={
          ctx.interactive
            ? () => {
                ctx.onCheckedChange(component.id, !isOn);
                if (component.actions) {
                  for (const action of component.actions) {
                    ctx.onAction({
                      type: action.type,
                      payload: { ...action, checked: !isOn, entry: ctx.entry },
                      formValues: ctx.formValues,
                    });
                  }
                }
              }
            : undefined
        }
        onKeyDown={
          ctx.interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  ctx.onCheckedChange(component.id, !isOn);
                }
              }
            : undefined
        }
        tabIndex={ctx.interactive ? 0 : undefined}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          backgroundColor: isOn ? '#6366f1' : '#334155',
          position: 'relative' as const,
          transition: 'background-color 0.2s',
          cursor: ctx.interactive ? 'pointer' : 'default',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: '#f8fafc',
            position: 'absolute' as const,
            top: 3,
            left: isOn ? 23 : 3,
            transition: 'left 0.2s',
          }}
        />
      </div>
      {props.label || 'Toggle'}
    </label>
  );
};

const renderDatePicker: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  return (
    <div style={{ ...ctx.resolvedStyle }}>
      {props.label && (
        <label
          style={{
            display: 'block',
            color: '#94a3b8',
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          {props.label}
        </label>
      )}
      <input
        type="date"
        value={ctx.interactive ? (ctx.formValues[component.id] ?? '') : undefined}
        onChange={ctx.interactive ? (e) => ctx.onFormChange(component.id, e.target.value) : undefined}
        placeholder={props.placeholder || 'Select date...'}
        readOnly={!ctx.interactive}
        disabled={!ctx.interactive}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 8,
          color: '#f8fafc',
          fontSize: 14,
          boxSizing: 'border-box' as const,
          outline: 'none',
          colorScheme: 'dark',
        }}
      />
    </div>
  );
};

const renderSlider: ComponentRenderer = (component, ctx) => {
  const { props } = component;
  const sliderVal = ctx.interactive
    ? (ctx.formValues[component.id] ?? String(props.value ?? 50))
    : String(props.value ?? 50);
  return (
    <div style={{ ...ctx.resolvedStyle }}>
      {props.label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 6,
          }}
        >
          <label style={{ color: '#94a3b8', fontSize: 12 }}>
            {props.label}
          </label>
          <span style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600 }}>
            {sliderVal}
          </span>
        </div>
      )}
      <input
        type="range"
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        value={sliderVal}
        onChange={ctx.interactive ? (e) => ctx.onFormChange(component.id, e.target.value) : undefined}
        disabled={!ctx.interactive}
        style={{
          width: '100%',
          accentColor: '#6366f1',
          cursor: ctx.interactive ? 'pointer' : 'default',
        }}
      />
    </div>
  );
};

export const inputRenderers = {
  input: renderInput,
  combobox: renderCombobox,
  checkbox: renderCheckbox,
  switch: renderSwitch,
  date_picker: renderDatePicker,
  slider: renderSlider,
};
