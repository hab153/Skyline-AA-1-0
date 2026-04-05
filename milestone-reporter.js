// file: milestone-reporter.js

/**
 * SKYLINE AA-1 - WEEK 30
 * The Milestone Reporter: Generates the final "Version 0.5 Ready" summary report.
 */

class MilestoneReporter {
    static generateReport(testResults, securityReport, contradictionReport, fileCount) {
        const timestamp = new Date().toISOString();
        
        // Calculate Overall Score
        let score = 100;
        const issues = [];

        // Deduct for Security Issues
        if (securityReport && securityReport.issues) {
            const criticalCount = securityReport.issues.filter(i => i.severity === 'CRITICAL').length;
            const highCount = securityReport.issues.filter(i => i.severity === 'HIGH').length;
            score -= (criticalCount * 20);
            score -= (highCount * 10);
            if (criticalCount > 0) issues.push(`${criticalCount} Critical Security Issues`);
        }

        // Deduct for Contradictions
        if (contradictionReport && contradictionReport.hasContradictions) {
            score -= 30;
            issues.push(`${contradictionReport.details.length} Logical Contradictions`);
        }

        // Deduct for Failed Tests
        if (testResults && !testResults.allPassed) {
            const failedCount = testResults.total - testResults.passedCount;
            score -= (failedCount * 15);
            issues.push(`${failedCount} Failed Tests`);
        }

        score = Math.max(0, score);
        const isReady = score >= 80 && !(contradictionReport && contradictionReport.hasContradictions);

        return {
            version: "0.5",
            timestamp,
            isReady,
            score,
            summary: {
                filesGenerated: fileCount,
                testsRun: testResults ? testResults.total : 0,
                testsPassed: testResults ? testResults.passedCount : 0,
                securityScore: securityReport ? securityReport.score : 100,
                contradictions: contradictionReport ? contradictionReport.details.length : 0
            },
            issues,
            message: isReady 
                ? "🚀 Skyline AA-1 v0.5 READY! All systems operational." 
                : "⚠️ Review required before deployment."
        };
    }

    static printReport(report) {
        console.log("\n" + "=".repeat(50));
        console.log(`🏆 SKYLINE AA-1 MILESTONE REPORT v${report.version}`);
        console.log("=".repeat(50));
        console.log(`Status: ${report.isReady ? '✅ READY' : '⚠️ NEEDS REVIEW'}`);
        console.log(`Overall Score: ${report.score}/100`);
        console.log(`Files Generated: ${report.summary.filesGenerated}`);
        console.log(`Tests: ${report.summary.testsPassed}/${report.summary.testsRun} Passed`);
        console.log(`Security Score: ${report.summary.securityScore}/100`);
        console.log(`Contradictions: ${report.summary.contradictions}`);
        
        if (report.issues.length > 0) {
            console.log("\n⚠️ Issues Found:");
            report.issues.forEach(issue => console.log(`   - ${issue}`));
        } else {
            console.log("\n✅ No critical issues found!");
        }
        
        console.log(`\n💬 Message: ${report.message}`);
        console.log("=".repeat(50) + "\n");
    }
}

module.exports = { MilestoneReporter };
