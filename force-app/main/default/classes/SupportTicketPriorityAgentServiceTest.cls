@isTest
private class SupportTicketPriorityAgentServiceTest {

    @isTest
    static void testCriticalOutagePrediction() {
        SupportTicketPriorityAgentService.TicketInputRequest req = new SupportTicketPriorityAgentService.TicketInputRequest();
        req.subject = 'CRITICAL: Database Cluster Down';
        req.description = 'Downtime affecting all production nodes!';
        req.customerTier = 'VIP Enterprise';
        req.productCategory = 'Infrastructure & Servers';

        Test.startTest();
        List<SupportTicketPriorityAgentService.TicketPredictionResult> results = 
            SupportTicketPriorityAgentService.predictTicketPriority(new List<SupportTicketPriorityAgentService.TicketInputRequest>{ req });
        Test.stopTest();

        System.assertEquals(1, results.size(), 'Should return 1 prediction result');
        System.assertEquals('CRITICAL', results[0].priority, 'Priority should be CRITICAL');
        System.assertEquals(15, results[0].slaTargetMinutes, 'SLA should be 15 minutes');
    }

    @isTest
    static void testHighRevenuePrediction() {
        SupportTicketPriorityAgentService.TicketInputRequest req = new SupportTicketPriorityAgentService.TicketInputRequest();
        req.subject = 'Payment Gateway Timeout';
        req.description = 'Customers getting Stripe checkout payment error';
        req.customerTier = 'Business';
        req.productCategory = 'Billing & Payments';

        Test.startTest();
        List<SupportTicketPriorityAgentService.TicketPredictionResult> results = 
            SupportTicketPriorityAgentService.predictTicketPriority(new List<SupportTicketPriorityAgentService.TicketInputRequest>{ req });
        Test.stopTest();

        System.assertEquals(1, results.size());
        System.assertEquals('HIGH', results[0].priority);
    }

    @isTest
    static void testMediumLatencyPrediction() {
        SupportTicketPriorityAgentService.TicketInputRequest req = new SupportTicketPriorityAgentService.TicketInputRequest();
        req.subject = 'SSO Login delay';
        req.description = 'Authentication slow for secondary users';
        req.customerTier = 'Standard';

        Test.startTest();
        List<SupportTicketPriorityAgentService.TicketPredictionResult> results = 
            SupportTicketPriorityAgentService.predictTicketPriority(new List<SupportTicketPriorityAgentService.TicketInputRequest>{ req });
        Test.stopTest();

        System.assertEquals(1, results.size());
        System.assertEquals('MEDIUM', results[0].priority);
    }

    @isTest
    static void testLowPriorityPrediction() {
        SupportTicketPriorityAgentService.TicketInputRequest req = new SupportTicketPriorityAgentService.TicketInputRequest();
        req.subject = 'General inquiry';
        req.description = 'How to change profile avatar';
        req.customerTier = 'Standard';

        Test.startTest();
        List<SupportTicketPriorityAgentService.TicketPredictionResult> results = 
            SupportTicketPriorityAgentService.predictTicketPriority(new List<SupportTicketPriorityAgentService.TicketInputRequest>{ req });
        Test.stopTest();

        System.assertEquals(1, results.size());
        System.assertEquals('LOW', results[0].priority);
    }

    @isTest
    static void testEmptyRequest() {
        Test.startTest();
        List<SupportTicketPriorityAgentService.TicketPredictionResult> results = 
            SupportTicketPriorityAgentService.predictTicketPriority(new List<SupportTicketPriorityAgentService.TicketInputRequest>());
        Test.stopTest();

        System.assertEquals(0, results.size());
    }
}
