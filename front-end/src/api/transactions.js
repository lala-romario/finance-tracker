import api from './axios';

export const resetCurrentMonthTransactions = async () => {
    const response = await api.delete('/transactions/current-month');

    return response.data;
};

