#!/usr/bin/env python3
"""
Autonomous PCAM Programming Assistant - Test Client
Demonstrates how to interact with the N8N workflow for autonomous programming tasks.
"""

import json
import requests
import time
from typing import Dict, Any, Optional

class PCamProgrammingClient:
    """Client for interacting with the Autonomous PCAM Programming N8N workflow."""
    
    def __init__(self, webhook_url: str, timeout: int = 300):
        """
        Initialize the PCAM client.
        
        Args:
            webhook_url: The N8N webhook URL for the autonomous programming workflow
            timeout: Request timeout in seconds (default: 5 minutes)
        """
        self.webhook_url = webhook_url
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'PCamProgrammingClient/1.0'
        })
    
    def execute_programming_task(self, prompt: str, project_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute a programming task using PCAM decomposition.
        
        Args:
            prompt: Natural language description of the programming task
            project_path: Optional path to the project directory
            
        Returns:
            Dict containing the execution results and analysis
            
        Raises:
            requests.RequestException: If the request fails
            ValueError: If the response is invalid
        """
        
        payload = {"prompt": prompt}
        if project_path:
            payload["projectPath"] = project_path
            
        print(f"🚀 Sending autonomous programming request...")
        print(f"📝 Prompt: {prompt}")
        if project_path:
            print(f"📁 Project Path: {project_path}")
        print(f"⏳ Waiting for autonomous execution...")
        
        try:
            response = self.session.post(
                self.webhook_url,
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            result = response.json()
            self._print_results(result)
            return result
            
        except requests.exceptions.Timeout:
            raise requests.RequestException("Request timed out - autonomous execution may still be running")
        except requests.exceptions.RequestException as e:
            raise requests.RequestException(f"Failed to execute programming task: {e}")
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON response from N8N workflow")
    
    def _print_results(self, result: Dict[str, Any]) -> None:
        """Print formatted results from the autonomous execution."""
        
        print("\n" + "="*60)
        print("🤖 AUTONOMOUS PCAM PROGRAMMING RESULTS")
        print("="*60)
        
        status = result.get('status', 'unknown')
        if status == 'success':
            print("✅ Status: SUCCESS")
            
            # Execution Summary
            summary = result.get('execution_summary', {})
            print(f"🔧 Operations Count: {summary.get('operations_count', 0)}")
            print(f"🛡️  Safety Checks: {'✅ PASSED' if summary.get('safety_checks_passed') else '❌ FAILED'}")
            print(f"🤝 User Intervention: {'❗ REQUIRED' if summary.get('user_intervention_required') else '🤖 AUTONOMOUS'}")
            
            # Project Analysis
            analysis = result.get('project_analysis', {})
            if analysis:
                print(f"\n📊 PROJECT ANALYSIS:")
                
                deps = analysis.get('dependencies_found', [])
                if deps:
                    print(f"   📦 Dependencies: {', '.join(deps)}")
                
                missing = analysis.get('missing_files', [])
                if missing:
                    print(f"   📄 Missing Files: {', '.join(missing)}")
                
                improvements = analysis.get('potential_improvements', [])
                if improvements:
                    print(f"   🔧 Improvements: {len(improvements)} suggested")
                    for imp in improvements[:3]:  # Show first 3
                        print(f"      • {imp}")
            
            # Next Steps
            next_steps = result.get('next_steps', [])
            if next_steps:
                print(f"\n📋 NEXT STEPS:")
                for step in next_steps[:5]:  # Show first 5
                    priority = step.get('priority', 'medium')
                    desc = step.get('description', 'No description')
                    automated = "🤖 AUTO" if step.get('automated') else "👤 MANUAL"
                    print(f"   {automated} [{priority.upper()}] {desc}")
                    
        else:
            print("❌ Status: ERROR/SAFETY OVERRIDE")
            print(f"💬 Message: {result.get('message', 'No message provided')}")
            print(f"🔍 Reason: {result.get('reason', 'No reason provided')}")
            
            confidence = result.get('automation_confidence')
            if confidence is not None:
                print(f"🎯 Automation Confidence: {confidence:.1%}")
                
            recommendation = result.get('recommended_action')
            if recommendation:
                print(f"💡 Recommendation: {recommendation}")
        
        session_id = result.get('session_id')
        if session_id:
            print(f"\n🆔 Session ID: {session_id}")
            
        timestamp = result.get('timestamp')
        if timestamp:
            print(f"⏰ Completed: {timestamp}")
            
        print("="*60 + "\n")

# Example usage and test cases
def main():
    """Example usage of the PCAM Programming Client."""
    
    # Replace with your actual N8N webhook URL
    WEBHOOK_URL = "https://your-n8n-instance.com/webhook/autonomous-programming"
    
    client = PCamProgrammingClient(WEBHOOK_URL)
    
    # Test cases for different types of programming tasks
    test_cases = [
        {
            "prompt": "Analyze my React project structure and identify missing dependencies",
            "project_path": "/Users/developer/my-react-app"
        },
        {
            "prompt": "Run all tests and generate a coverage report for the Python project",
            "project_path": "/Users/developer/python-api"
        },
        {
            "prompt": "Build and optimize the Rust application for production deployment",
            "project_path": "/Users/developer/rust-service"
        },
        {
            "prompt": "Create a new Express.js API endpoint for user authentication",
            "project_path": "/Users/developer/node-backend"
        },
        {
            "prompt": "Refactor the database queries to improve performance and add proper indexing",
            "project_path": "/Users/developer/database-project"
        }
    ]
    
    print("🧪 AUTONOMOUS PCAM PROGRAMMING - TEST SUITE")
    print("="*50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔬 Test Case {i}/{len(test_cases)}")
        print("-" * 30)
        
        try:
            result = client.execute_programming_task(
                prompt=test_case["prompt"],
                project_path=test_case.get("project_path")
            )
            
            # Brief pause between requests
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ Test case failed: {e}")
            continue
    
    print("\n🏁 Test suite completed!")

if __name__ == "__main__":
    # Interactive mode for custom prompts
    WEBHOOK_URL = input("Enter your N8N webhook URL: ").strip()
    
    if not WEBHOOK_URL:
        print("❌ No webhook URL provided. Exiting.")
        exit(1)
    
    client = PCamProgrammingClient(WEBHOOK_URL)
    
    print("\n🤖 Autonomous PCAM Programming Assistant")
    print("Type your programming requests below (or 'quit' to exit):\n")
    
    while True:
        try:
            prompt = input("💬 Programming Task: ").strip()
            
            if prompt.lower() in ['quit', 'exit', 'q']:
                break
                
            if not prompt:
                continue
                
            project_path = input("📁 Project Path (optional): ").strip()
            project_path = project_path if project_path else None
            
            result = client.execute_programming_task(prompt, project_path)
            
            print("\nPress Enter to continue or 'quit' to exit...")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            continue