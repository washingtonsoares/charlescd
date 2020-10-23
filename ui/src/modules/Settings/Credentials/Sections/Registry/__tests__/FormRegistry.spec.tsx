/*
 * Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render, fireEvent, act, screen } from 'unit-test/testUtils';
import FormRegistry from '../Form';
import { FetchMock } from 'jest-fetch-mock';
import MutationObserver from 'mutation-observer';
import { Props as AceEditorprops } from 'core/components/Form/AceEditor';
import { Controller as MockController } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

(global as any).MutationObserver = MutationObserver;

const mockOnFinish = jest.fn();
const mockSave = jest.fn();
const mockValidation = jest.fn();

afterEach(() => {
  mockSave.mockClear();
});

beforeEach(() => {
  (fetch as FetchMock).resetMocks();
});

jest.mock('../hooks', () => {
  return {
    __esModule: true,
    useRegistry: () => ({
      save: mockSave,
    }),
    useRegistryTest: () => ({
      test: mockValidation,
      status: {}
    })
  };
});

jest.mock('core/components/Form/AceEditor', () => {
  return {
    __esModule: true,
    A: true,
    default: ({
      control,
      rules,
      name,
      className,
      defaultValue
    }: AceEditorprops) => {
      return (
        <MockController
          as={
            <textarea name={name} data-testid={`input-text-${name}`}></textarea>
          }
          rules={rules}
          name={name}
          control={control}
          className={className}
          defaultValue={defaultValue}
        />
      );
    }
  };
});

test('render Registry form default component', async () => {
  const { container } = render(
    <FormRegistry onFinish={mockOnFinish}/>
  );

  expect(container.innerHTML).toMatch("test");
});

test('render Registry form with azure values', async () => {
  render(
    <FormRegistry onFinish={mockOnFinish}/>
  );

  const radioButton = screen.getByTestId("radio-group-registry-item-AZURE");
  await act(async () => userEvent.click(radioButton));

  const text = screen.getByText('Enter the username');
  expect(text).toBeInTheDocument();
});

test('render Registry form with AWS values', async () => {
  render(
    <FormRegistry onFinish={mockOnFinish}/>
  );

  const radioButton = screen.getByTestId("radio-group-registry-item-AWS");
  await act(async () => userEvent.click(radioButton));
  
  const text = screen.getByText('Enter the region');
  expect(text).toBeInTheDocument();
});

test('render Registry form with AWS values and secret input', () => {
  render(<FormRegistry onFinish={mockOnFinish}/>);
  
  const radioButton = screen.getByTestId("radio-group-registry-item-AWS");
  userEvent.click(radioButton);
  
  const radioAuthButton = screen.getByTestId("switch-aws-auth-handler");
  userEvent.click(radioAuthButton);

  const text = screen.getByText('Enter the access key');
  expect(text).toBeInTheDocument();
});

test('render Registry form without AWS values and secret input', async () => {
  render(<FormRegistry onFinish={mockOnFinish}/>);
  
  const radioButton = screen.getByTestId("radio-group-registry-item-AWS");
  await act(async () => userEvent.click(radioButton));
  
  const text = screen.queryByText('Enter the access key');
  expect(text).not.toBeInTheDocument();
});

test('render Registry form with GCP form', () => {
  render(
    <FormRegistry onFinish={mockOnFinish} />
  );

  const radioButton = screen.getByTestId('radio-group-registry-item-GCP');
  act(() => userEvent.click(radioButton));
  
  const projectIdInput = screen.getByText('Enter the project id');
  expect(projectIdInput).toBeInTheDocument();
});

test('Not trigger onSubmit on json parse error with GCP form', async () => {
  render(<FormRegistry onFinish={mockOnFinish} />);

  const radioButton = screen.getByTestId('radio-group-registry-item-GCP');
  act(() => userEvent.click(radioButton));
  
  const inputGCPName = screen.getByTestId('input-text-name');
  expect(inputGCPName).toBeInTheDocument();

  const inputGCPAddress = screen.getByTestId('input-text-address');
  expect(inputGCPAddress).toBeInTheDocument();

  const inputGCPOrganization = screen.getByTestId('input-text-organization');
  expect(inputGCPOrganization).toBeInTheDocument();

  const inputGCPJsonKey = screen.getByTestId('input-text-jsonKey');
  expect(inputGCPJsonKey).toBeInTheDocument();

  const submitButton = screen.getByTestId('button-default-submit-registry');
  expect(submitButton).toBeInTheDocument();

  await act(async () => {
    userEvent.type(inputGCPName, 'fake-name');
    userEvent.type(inputGCPAddress, 'http://fake-host');
    userEvent.type(inputGCPOrganization, 'fake-access-key');
    userEvent.type(inputGCPJsonKey, 'te');
    userEvent.click(submitButton);
  });

  expect(mockSave).not.toBeCalled();
});

// TODO
test.skip('Trigger submit on json parse success with GCP form', async () => {
  (fetch as FetchMock).mockResponse(JSON.stringify({ message: 'response' }));

  render(<FormRegistry onFinish={mockOnFinish} />);

  const radioButton = screen.getByTestId('radio-group-registry-item-GCP');
  await act(async () => userEvent.click(radioButton));
  const inputGCPName = screen.getByTestId('input-text-name');
  const inputGCPAddress = screen.getByTestId('input-text-address');
  const inputGCPOrganization = screen.getByTestId('input-text-organization');
  const inputGCPJsonKey = screen.getByTestId('input-text-jsonKey');
  const submitButton = screen.getByTestId('button-default-submit-registry');
  const testConnectionButton = screen.getByTestId('button-default-test-connection');

  userEvent.type(inputGCPName, 'fake-name');
  userEvent.type(inputGCPAddress, 'http://fake-host');
  userEvent.type(inputGCPOrganization, 'fake-access-key');
  // fireEvent.change(inputGCPJsonKey, '{ target: { value: {"testKey": "testValue"} } }');
  userEvent.type(inputGCPJsonKey, '{ "testKey": "testValue"}');

  screen.debug();
  fireEvent.click(testConnectionButton);
  fireEvent.click(submitButton);

  // expect(submitButton).toBeDisabled();
  // expect(testConnectionButton).toBeDisabled();
  expect(mockSave).toBeCalledTimes(1);
});

// TODO
test.skip('render Registry form with Docker Hub form', async () => {
  const { container, getByTestId } = render(
    <FormRegistry onFinish={mockOnFinish}/>
  );

  await wait();
  const radioButton = getByTestId('radio-group-registry-item-DOCKER_HUB');
  fireEvent.click(radioButton)
  await wait();
  expect(container.innerHTML).toMatch('Enter the username');
  expect(container.innerHTML).not.toMatch('Enter the address');
});

test('execute onSubmit of AWS registry', async () => {
  render(
    <FormRegistry onFinish={mockOnFinish}/>
  );

  const radioButton = screen.getByTestId("radio-group-registry-item-AWS");
  await act(async () => userEvent.click(radioButton));
  
  const radioAuthButton = screen.getByTestId("switch-aws-auth-handler");
  await act(async () => userEvent.click(radioAuthButton));
  
  const inputAwsName = screen.getByTestId("input-text-name");

  const inputAwsAddress = screen.getByTestId("input-text-address");
  expect(inputAwsName).toBeInTheDocument();

  const inputAwsAccessKey = screen.getByTestId("input-password-accessKey");
  expect(inputAwsAccessKey).toBeInTheDocument();

  const inputAwsSecretKey = screen.getByTestId("input-text-secretKey");
  expect(inputAwsSecretKey).toBeInTheDocument();

  const inputAwsRegion = screen.getByTestId("input-text-region");
  expect(inputAwsRegion).toBeInTheDocument();

  const submitButton = screen.getByTestId("button-default-submit-registry");
  expect(submitButton).toBeInTheDocument();

  await act(async () => {
    userEvent.type(inputAwsName, 'fake-name');
    userEvent.type(inputAwsAddress, 'http://fake-host');
    userEvent.type(inputAwsAccessKey, 'fake-access-key');
    userEvent.type(inputAwsSecretKey, 'fake-secret-key');
    userEvent.type(inputAwsRegion, 'fake-region');
    userEvent.click(submitButton);
  });
  
  expect(mockSave).toBeCalledTimes(1);
});

test('should not execute onSubmit because validation (missing name)', async () => {
  render(
    <FormRegistry onFinish={mockOnFinish}/>
  );

  const radioButton = screen.getByTestId("radio-group-registry-item-AWS");
  await act(async () => userEvent.click(radioButton));
  
  const radioAuthButton = screen.getByTestId("switch-aws-auth-handler");
  userEvent.click(radioAuthButton);
  
  const inputAwsAddress = screen.getByTestId("input-text-address");
  expect(inputAwsAddress).toBeInTheDocument();

  const inputAwsAccessKey = screen.getByTestId("input-password-accessKey");
  expect(inputAwsAccessKey).toBeInTheDocument();

  const inputAwsSecretKey = screen.getByTestId("input-text-secretKey");
  expect(inputAwsSecretKey).toBeInTheDocument();

  const inputAwsRegion = screen.getByTestId("input-text-region");
  expect(inputAwsRegion).toBeInTheDocument();

  const submitButton = screen.getByTestId("button-default-submit-registry");
  expect(submitButton).toBeInTheDocument();

  await act(async () => {
    userEvent.type(inputAwsAddress, 'http://fake-host');
    userEvent.type(inputAwsAccessKey, 'fake-access-key');
    userEvent.type(inputAwsSecretKey, 'fake-secret-key');
    userEvent.type(inputAwsRegion, 'fake-region');
    userEvent.click(submitButton);
  });
  
  expect(mockSave).not.toBeCalled();
});
