import { 
    IAlertDispatcher, 
    IAlertHistory, 
    IAlertRule, 
    AlertSeverity 
} from '../../../../domain/platform/ports/IObservability';

export class AlertEngine {
    private rules: IAlertRule[] = [];

    constructor(private readonly dispatcher: IAlertDispatcher) {}

    public addRule(rule: IAlertRule): void {
        this.rules.push(rule);
    }

    public async evaluateCondition(ruleId: string, conditionMet: boolean, message: string): Promise<void> {
        if (conditionMet) {
            const rule = this.rules.find(r => r.id === ruleId);
            if (rule) {
                const history: IAlertHistory = {
                    id: Math.random().toString(36).substring(7),
                    ruleId: rule.id,
                    timestamp: new Date(),
                    message,
                    severity: rule.severity
                };
                await this.dispatcher.dispatch(history);
            }
        }
    }
}
