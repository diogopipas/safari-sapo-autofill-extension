//
//  ViewController.swift
//  Shared (App)
//
//  Created by Diogo Porto on 04/11/2025.
//

import WebKit

#if os(iOS)
import UIKit
typealias PlatformViewController = UIViewController
#elseif os(macOS)
import Cocoa
import SafariServices
typealias PlatformViewController = NSViewController
#endif

let extensionBundleIdentifier = "com.yourCompany.SAPO-Emprego-Autofill.Extension"

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

#if os(iOS)
        self.webView.scrollView.isScrollEnabled = true
#endif

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
#if os(iOS)
        webView.evaluateJavaScript("show('ios')")
#elseif os(macOS)
        webView.evaluateJavaScript("show('mac')")

        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), true)")
                } else {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), false)")
                }
            }
        }
#endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let messageBody = message.body as? [String: Any],
              let action = messageBody["action"] as? String else {
            // Handle legacy "open-preferences" message
            if let stringMessage = message.body as? String, stringMessage == "open-preferences" {
                handleOpenPreferences()
            }
            return
        }
        
        switch action {
        case "save-data":
            handleSaveData(messageBody)
        case "load-data":
            handleLoadData()
        default:
            break
        }
    }
    
    func handleOpenPreferences() {
#if os(macOS)
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            guard error == nil else {
                return
            }

            DispatchQueue.main.async {
                NSApp.terminate(self)
            }
        }
#endif
    }
    
    func handleSaveData(_ messageBody: [String: Any]) {
        guard let formData = messageBody["formData"] as? [String: Any],
              let fileData = messageBody["fileData"] as? [String: Any] else {
            return
        }
        
        // Get the extension directory
        guard let extensionURL = getExtensionDirectory() else {
            DispatchQueue.main.async {
                self.webView.evaluateJavaScript("showStatus('Error: Could not find extension directory', 'error')")
            }
            return
        }
        
        // Write userData.js
        let userDataContent = generateUserDataJS(formData: formData)
        let userDataURL = extensionURL.appendingPathComponent("userData.js")
        
        do {
            try userDataContent.write(to: userDataURL, atomically: true, encoding: .utf8)
        } catch {
            DispatchQueue.main.async {
                self.webView.evaluateJavaScript("showStatus('Error saving user data: \(error.localizedDescription)', 'error')")
            }
            return
        }
        
        // Write fileData.js
        let fileDataContent = generateFileDataJS(fileData: fileData)
        let fileDataURL = extensionURL.appendingPathComponent("fileData.js")
        
        do {
            try fileDataContent.write(to: fileDataURL, atomically: true, encoding: .utf8)
            DispatchQueue.main.async {
                self.webView.evaluateJavaScript("showStatus('Data saved successfully!', 'success')")
            }
        } catch {
            DispatchQueue.main.async {
                self.webView.evaluateJavaScript("showStatus('Error saving file data: \(error.localizedDescription)', 'error')")
            }
        }
    }
    
    func handleLoadData() {
        guard let extensionURL = getExtensionDirectory() else {
            return
        }
        
        let userDataURL = extensionURL.appendingPathComponent("userData.js")
        let fileDataURL = extensionURL.appendingPathComponent("fileData.js")
        
        var formData: [String: Any] = [:]
        var fileData: [String: Any] = [:]
        
        // Read userData.js
        if let userDataContent = try? String(contentsOf: userDataURL, encoding: .utf8) {
            formData = parseUserDataJS(userDataContent)
        }
        
        // Read fileData.js
        if let fileDataContent = try? String(contentsOf: fileDataURL, encoding: .utf8) {
            fileData = parseFileDataJS(fileDataContent)
        }
        
        // Send data back to JavaScript
        let response: [String: Any] = [
            "type": "load-data-response",
            "data": [
                "formData": formData,
                "fileData": fileData
            ]
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: response),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            let script = "window.postMessage(\(jsonString), '*');"
            DispatchQueue.main.async {
                self.webView.evaluateJavaScript(script)
            }
        }
    }
    
    func getExtensionDirectory() -> URL? {
        // For development: write to the project root directory
        // This allows the extension to read the files directly
        let fileManager = FileManager.default
        
        // Try to find the project root by looking for common project files
        if let currentPath = fileManager.currentDirectoryPath as String? {
            var searchPath = URL(fileURLWithPath: currentPath)
            
            // Look for the project root (where manifest.json exists)
            for _ in 0..<10 {
                let manifestURL = searchPath.appendingPathComponent("manifest.json")
                if fileManager.fileExists(atPath: manifestURL.path) {
                    return searchPath
                }
                searchPath = searchPath.deletingLastPathComponent()
                if searchPath.path == "/" {
                    break
                }
            }
        }
        
        // Fallback: try to find from bundle resource path
        if let resourcePath = Bundle.main.resourcePath {
            var searchPath = URL(fileURLWithPath: resourcePath)
            
            // Navigate up to find project root
            for _ in 0..<10 {
                let manifestURL = searchPath.appendingPathComponent("manifest.json")
                if fileManager.fileExists(atPath: manifestURL.path) {
                    return searchPath
                }
                searchPath = searchPath.deletingLastPathComponent()
                if searchPath.path == "/" {
                    break
                }
            }
        }
        
        // Last resort: use Documents directory
        if let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first {
            return documentsPath
        }
        
        return nil
    }
    
    func generateUserDataJS(formData: [String: Any]) -> String {
        let name = formData["name"] as? String ?? ""
        let email = formData["email"] as? String ?? ""
        let phone = formData["phone"] as? String ?? ""
        
        return """
// Personal information configuration
// This file is auto-generated by the app

const FORM_DATA = {
  name: '\(name.replacingOccurrences(of: "'", with: "\\'"))',
  email: '\(email.replacingOccurrences(of: "'", with: "\\'"))',
  phone: '\(phone.replacingOccurrences(of: "'", with: "\\'"))'
};

"""
    }
    
    func generateFileDataJS(fileData: [String: Any]) -> String {
        let photo = fileData["photo"] as? [String: Any] ?? [:]
        let cv = fileData["cv"] as? [String: Any] ?? [:]
        
        let photoName = photo["name"] as? String ?? "photo.png"
        let photoType = photo["type"] as? String ?? "image/png"
        let photoBase64 = photo["base64"] as? String ?? ""
        
        let cvName = cv["name"] as? String ?? "CV.pdf"
        let cvType = cv["type"] as? String ?? "application/pdf"
        let cvBase64 = cv["base64"] as? String ?? ""
        
        return """
// Auto-generated file data - DO NOT EDIT MANUALLY
// Generated on: \(ISO8601DateFormatter().string(from: Date()))

const FILE_DATA = {
  photo: {
    name: '\(photoName)',
    type: '\(photoType)',
    base64: '\(photoBase64)'
  },
  cv: {
    name: '\(cvName)',
    type: '\(cvType)',
    base64: '\(cvBase64)'
  }
};

// Helper function to convert base64 to File object
function base64ToFile(base64Data, filename, mimeType) {
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create blob and file
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

// Make available to content script
if (typeof window !== 'undefined') {
  window.FILE_DATA = FILE_DATA;
  window.base64ToFile = base64ToFile;
}

"""
    }
    
    func parseUserDataJS(_ content: String) -> [String: Any] {
        var formData: [String: Any] = [:]
        
        // Simple parsing - look for name, email, phone values
        if let nameRange = content.range(of: "name: '") {
            let afterName = String(content[nameRange.upperBound...])
            if let nameEndRange = afterName.range(of: "'") {
                formData["name"] = String(afterName[..<nameEndRange.lowerBound])
            }
        }
        
        if let emailRange = content.range(of: "email: '") {
            let afterEmail = String(content[emailRange.upperBound...])
            if let emailEndRange = afterEmail.range(of: "'") {
                formData["email"] = String(afterEmail[..<emailEndRange.lowerBound])
            }
        }
        
        if let phoneRange = content.range(of: "phone: '") {
            let afterPhone = String(content[phoneRange.upperBound...])
            if let phoneEndRange = afterPhone.range(of: "'") {
                formData["phone"] = String(afterPhone[..<phoneEndRange.lowerBound])
            }
        }
        
        return formData
    }
    
    func parseFileDataJS(_ content: String) -> [String: Any] {
        var fileData: [String: Any] = [:]
        
        // Find photo section
        if let photoSectionStart = content.range(of: "photo: {") {
            let photoSection = String(content[photoSectionStart.upperBound...])
            
            // Parse photo name
            if let photoNameStart = photoSection.range(of: "name: '") {
                let afterPhotoName = String(photoSection[photoNameStart.upperBound...])
                if let photoNameEnd = afterPhotoName.range(of: "'") {
                    let photoName = String(afterPhotoName[..<photoNameEnd.lowerBound])
                    
                    // Parse photo type
                    var photoType = "image/png"
                    if let photoTypeStart = photoSection.range(of: "type: '") {
                        let afterPhotoType = String(photoSection[photoTypeStart.upperBound...])
                        if let photoTypeEnd = afterPhotoType.range(of: "'") {
                            photoType = String(afterPhotoType[..<photoTypeEnd.lowerBound])
                        }
                    }
                    
                    // Parse photo base64 (find the last quote before cv:)
                    if let photoBase64Start = photoSection.range(of: "base64: '") {
                        let afterPhotoBase64 = String(photoSection[photoBase64Start.upperBound...])
                        // Find the closing quote (before cv: or closing brace)
                        var photoBase64 = ""
                        if let cvStart = afterPhotoBase64.range(of: "cv:") {
                            // Base64 ends before cv section
                            let base64Section = String(afterPhotoBase64[..<cvStart.lowerBound])
                            if let base64End = base64Section.range(of: "'", options: .backwards) {
                                photoBase64 = String(base64Section[..<base64End.lowerBound])
                            }
                        } else if let closingBrace = afterPhotoBase64.range(of: "'", options: .backwards) {
                            photoBase64 = String(afterPhotoBase64[..<closingBrace.lowerBound])
                        }
                        
                        if !photoBase64.isEmpty {
                            fileData["photo"] = [
                                "name": photoName,
                                "type": photoType,
                                "base64": photoBase64
                            ]
                        }
                    }
                }
            }
        }
        
        // Find CV section
        if let cvSectionStart = content.range(of: "cv: {") {
            let cvSection = String(content[cvSectionStart.upperBound...])
            
            // Parse CV name
            if let cvNameStart = cvSection.range(of: "name: '") {
                let afterCvName = String(cvSection[cvNameStart.upperBound...])
                if let cvNameEnd = afterCvName.range(of: "'") {
                    let cvName = String(afterCvName[..<cvNameEnd.lowerBound])
                    
                    // Parse CV type
                    var cvType = "application/pdf"
                    if let cvTypeStart = cvSection.range(of: "type: '") {
                        let afterCvType = String(cvSection[cvTypeStart.upperBound...])
                        if let cvTypeEnd = afterCvType.range(of: "'") {
                            cvType = String(afterCvType[..<cvTypeEnd.lowerBound])
                        }
                    }
                    
                    // Parse CV base64
                    if let cvBase64Start = cvSection.range(of: "base64: '") {
                        let afterCvBase64 = String(cvSection[cvBase64Start.upperBound...])
                        // Find the last quote
                        if let cvBase64End = afterCvBase64.range(of: "'", options: .backwards) {
                            let cvBase64 = String(afterCvBase64[..<cvBase64End.lowerBound])
                            fileData["cv"] = [
                                "name": cvName,
                                "type": cvType,
                                "base64": cvBase64
                            ]
                        }
                    }
                }
            }
        }
        
        return fileData
    }

}
